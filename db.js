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
  await db.close();
}

async function mongodb(data) {
  try {
    const db = await mongoose.connect('mongodb://127.0.0.1:27017/DataNH');
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
    await Scraped.insertMany(data, function(error, docs) {console.log(error)});
    await db.disconnect();
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sqlite, mongodb };
