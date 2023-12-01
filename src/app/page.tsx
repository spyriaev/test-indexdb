"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { Button } from '@mui/material'
import { IndexedDBHandler } from './database'

export default function Home() {
  const handleClickButton = () => {
      // Example usage:
  const dbName = 'chat';
  const storeName = 'message';
  const rowsToInsert = 1000;
  
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

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Button onClick={handleClickButton} variant="outlined">Generate data</Button>
      </div>
    </main>
  )
}
