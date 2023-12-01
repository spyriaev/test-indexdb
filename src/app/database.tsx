export class IndexedDBHandler {
    private dbName: string;
    private storeName: string;
    private db: IDBDatabase | null = null;
  
    constructor(dbName: string, storeName: string) {
      this.dbName = dbName;
      this.storeName = storeName;
    }
  
    openDatabase(): Promise<void> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
  
        request.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
  
        request.onupgradeneeded = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.createObjectStore();
        };
  
        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };
      });
    }
  
    private createObjectStore() {
      if (this.db) {
        const objectStore = this.db.createObjectStore(this.storeName, { keyPath: 'mid', autoIncrement: false });
        objectStore.createIndex('conversationId', 'conversationId', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
        objectStore.createIndex('[source + conversationId + date]', ['source', 'conversationId', 'date'], { unique: false });
      }
    }
  
    insertRows(rowCount: number): Promise<void> {
      return new Promise(async (resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not open'));
          return;
        }
  
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
  
        for (let i = 0; i < rowCount; i++) {
          const newRow = generateRandomMessage();
          const request = objectStore.add(newRow);
  
          request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
          };
        }
  
        transaction.oncomplete = () => {
          resolve();
        };
      });
    }

    getMessagesWithinTimeRange(startTime: number, endTime: number): Promise<Message[]> {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not open'));
          return;
        }
        const requestStartTime = Date.now();  
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const range = IDBKeyRange.bound(startTime, endTime);
  
        const request = objectStore.index('date').openCursor(range);
        const messages: Message[] = [];
  
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            messages.push(cursor.value);
            cursor.continue();
          } else {
            const requestEndTime = Date.now();
            const requestTime = requestEndTime - requestStartTime;
            console.log(`Request completed in ${requestTime} ms`);
            resolve(messages);
          }
        };
  
        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    }
  }
  
  type Message = {
    clock: number,
    conversationId: string,
    date: number,
    editedAt: number,
    forward: number[],
    hostPeerId: number,
    isTempMessage: boolean,
    messageContent: MessageContent,
    mid: string,
    prevMid: string,
    randomId: string,
    refType: string | undefined,
    reply: string[],
    senderPeerId: string | undefined,
    senderUid: number,
    source: string,
    state: string,
    threadId: string
  }

  type MessageContent = {
    text: TextContent,
    type: "text"
  }

  type TextContent = {
    markdown: boolean,
    media: string[],
    mentions: string[],
    text: string
  }

  function generateRandomMessage(): Message {
    const randomMessage: Message = {
      clock: generateRandomTimestampWithinLastMonth(),
      conversationId: generateRandomString(),
      date: Date.now(),
      editedAt: Date.now() - Math.floor(Math.random() * 100000),
      forward: Array.from({ length: Math.floor(Math.random() * 5) }, () => Math.floor(Math.random() * 100)),
      hostPeerId: Math.floor(Math.random() * 100),
      isTempMessage: Math.random() < 0.5,
      messageContent: {
        text: {
          markdown: Math.random() < 0.5,
          media: Array.from({ length: Math.floor(Math.random() * 3) }, () => generateRandomString()),
          mentions: Array.from({ length: Math.floor(Math.random() * 3) }, () => generateRandomString()),
          text: generateRandomTextMessage()
        },
        type: "text"
      },
      mid: generateMid(),
      prevMid: generateRandomString(),
      randomId: generateRandomString(),
      refType: Math.random() < 0.5 ? generateRandomString() : undefined,
      reply: Array.from({ length: Math.floor(Math.random() * 5) }, () => generateRandomString()),
      senderPeerId: Math.random() < 0.5 ? generateRandomString() : undefined,
      senderUid: Math.floor(Math.random() * 100),
      source: generateRandomString(),
      state: generateRandomString(),
      threadId: generateRandomString()
    };
  
    return randomMessage;
  }

  export function generateRandomTimeRangeWithinLastMonth(): { startTime: number, endTime: number } {
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000; // Approximate milliseconds in a month
  
    const randomStartTimestamp = currentTimestamp - Math.floor(Math.random() * oneMonthInMillis);
    const randomEndTimestamp = randomStartTimestamp + Math.floor(Math.random() * oneMonthInMillis);
  
    return { startTime: randomStartTimestamp, endTime: randomEndTimestamp };
  }

  function generateMid(): string {
    const randomPart1 = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const randomPart2 = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return `-${randomPart1}|${randomPart2}`;
  }

  function generateRandomTextMessage(): string {
    const messageLength = Math.floor(Math.random() * 1100) + 100; // Generates a length between 100 and 1200 characters
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?/{}[]';
  
    let randomMessage = '';
  
    for (let i = 0; i < messageLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomMessage += characters.charAt(randomIndex);
    }
  
    return randomMessage;
  }

  function generateRandomTimestampWithinLastMonth(): number {
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000; // Approximate milliseconds in a month
  
    const randomTimestamp = currentTimestamp - Math.floor(Math.random() * oneMonthInMillis);
    return randomTimestamp;
  }

  function generateRandomString(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }