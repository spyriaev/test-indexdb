"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { Button } from '@mui/material'
import { IndexedDBHandler } from './database'
import { generateRandomTimeRangeWithinLastMonth } from './database'

export default function Home() {
  const handleClickGenerateRecords = () => {
  const dbName = 'chat';
  const storeName = 'message';
  const rowsToInsert = 100000;
  
  const dbHandler = new IndexedDBHandler(dbName, storeName);
  
  dbHandler.openDatabase()
    .then(() => dbHandler.insertRows(rowsToInsert))
    .then(() => {
      console.log(`${rowsToInsert} rows inserted successfully.`);
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
    });
  }

  const handleButtonRequestRescords = () => {
    const dbName = 'chat';
    const storeName = 'message';
    const dbHandler = new IndexedDBHandler(dbName, storeName);

    dbHandler.openDatabase()
    .then(() => {
      const requests = Array.from({ length: 100 }, () => {
        const {startTime, endTime} = generateRandomTimeRangeWithinLastMonth()        
        return dbHandler.getMessagesWithinTimeRange(startTime, endTime)
      });
  
      const results = Promise.all(requests);
      console.log('Messages within the time range:', results);
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
    });
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Button onClick={handleClickGenerateRecords} variant="outlined">Generate data</Button>
        <Button onClick={handleButtonRequestRescords} variant="outlined">Generate requests</Button>
      </div>
    </main>
  )
}
