'use strict';

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import mongoose from 'mongoose';
import { NHdata } from '../interface';

export async function sqlite(data: NHdata[]) {
  const db = await open({
    filename: 'data.db',
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS DataNH (
  	  id INT NOT NULL,
  	  name TEXT CHARACTER NOT NULL,
      link TEXT CHARACTER NOT NULL,
  	  img_link TEXT CHARACTER NOT NULL,
      unique (id, link)
      );`);
  data.forEach(async i => {
    await db.exec(
      `INSERT OR IGNORE INTO DataNH VALUES ("${i.id}", "${i.name}", "${i.link}", "${i.img}")`
    );
  });
  await db.close();
}

export async function mongodb(data: NHdata[], db: typeof mongoose) {
  const ScrapSchema = new mongoose.Schema({
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      unique: true,
    },
    img: {
      type: String,
      required: true,
    },
  });
  const Scraped = mongoose.model('Scraped', ScrapSchema);
  Scraped.insertMany(data, { ordered: false }, function () {
    console.log('DB Accessed');
    db.disconnect();
  });
}
