'use strict';

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const mongoose = require('mongoose');

async function sqlite(data) {
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
}

async function mongodb(data) {
  try {
    await mongoose.connect('mongodb://localhost:27017/DataNH');
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
      img_link: {
        type: String,
        required: true,
      },
    });
    const Scraped = mongoose.model('Scraped', ScrapSchema);
    data.forEach(async i => {
      new Scraped({ id: i.id, name: i.name, link: i.link, img_link: i.img });
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sqlite, mongodb };
