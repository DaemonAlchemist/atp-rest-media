/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import File from "../model/file";
import config from 'atp-config';
import AWS from 'aws-sdk';

const model = File;
const permissions = createCrudPermissions('media', 'file');
const idField = 'fileId';

export default basicController.entity.crud({
    model, permissions, idField,
    preInsert: file => new Promise((resolve, reject) => {
        const awsConfig = config.get('media.aws');
        AWS.config.update({region: awsConfig.region})
        const s3 = new AWS.S3({params: {Bucket: awsConfig.bucket}});
        const fileNameFull = file.fileName + "." + file.fileExtension;
        s3.upload({
            Key: fileNameFull,
            Body: Buffer.from(file.data, 'base64'),
            ACL: 'public-read',
        }, (err, data) => {
            if(err) {
                reject(err.message)
            } else {
                delete file.data;
                resolve(file);
            }
        });
    })
});
