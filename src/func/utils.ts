import { NHdata, OptionWriteData } from '../interface';
import fs from 'fs';
import lodash from 'lodash';
import mongoose from 'mongoose';
import { io } from 'socket.io-client';
import { mongodb } from './db';

export function getDifference(array1: NHdata[] | undefined, array2: NHdata[]) {
  if (!array1) return { a: 'placeholder' };
  if (!array2) return { a: 'placeholder' };
  return array1.filter(object1 => {
    return !array2.some(object2 => {
      return object1.id === object2.id;
    });
  });
}

export function readData(JSONFilePath: fs.PathLike) {
  const tempdata1 = fs.readFileSync(JSONFilePath, { encoding: 'utf8' });
  // parse JSON object
  let tempdata: NHdata[] | undefined;
  if (!lodash.isEmpty(tempdata1)) {
    tempdata = JSON.parse(tempdata1.toString());
    console.log('Read data from data.json');
    return tempdata;
  }
  return undefined;
}

export function writeData(resPage: NHdata[], option: Partial<OptionWriteData>) {
  if (option?.mongooseConfig?.enabled) {
    mongoose
      .connect(
        `mongodb://127.0.0.1:27017/${
          option?.mongooseConfig?.mongooseDB
            ? option.mongooseConfig.mongooseDB
            : 'DataNH'
        }`
      )
      .then(async db => {
        mongodb(resPage, db);
      })
      .catch(err => console.log(err));
  }
  // sqlite(resPage);

  if (option?.wsOption?.enabled) {
    try {
      const socket = io('ws://localhost:3000');

      socket.on('connect', () => {
        console.log('connected to ws');
      });
      socket.emit(
        option?.wsOption?.wsEvent ? option.wsOption.wsEvent : 'update',
        resPage,
        () => {
          console.log('written to ws');
          socket.disconnect();
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  const data = JSON.stringify(resPage, null, 2);
  try {
    fs.writeFileSync(
      option.JSONFilePath ? option.JSONFilePath : 'data.json',
      data
    );
    console.log(
      `Successfully write to ${
        option.JSONFilePath ? option.JSONFilePath : 'data.json'
      }`
    );
  } catch (err) {
    console.error(err);
  }
}
