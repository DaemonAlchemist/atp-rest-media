/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import File from "../model/file";
import {o} from 'atp-sugar';
import base64 from 'base-64';
import sharp from 'sharp';
import {remove, map} from 'atp-pointfree';
import config from 'atp-config';
import AWS from 'aws-sdk';

const model = File;
const permissions = createCrudPermissions('media', 'file');
const idField = 'fileId';

export default o(basicController.entity.crud({
    model, permissions, idField,
    preInsert: file => new Promise((resolve, reject) => {
        const awsConfig = config.get('media.aws');
        AWS.config.update({region: awsConfig.region})
        const s3 = new AWS.S3({params: {Bucket: awsConfig.bucket}});
        s3.upload({
            Key: awsConfig.folder + "/" + file.name,
            Body: Buffer.from(file.data, 'base64'),
            ACL: 'public-read',
        }, (err, data) => {
            if(err) {
                reject(err.message)
            } else {
                delete file.data;
                file.url = `https://${awsConfig.staticHost}/${awsConfig.bucket}/${awsConfig.folder}/${file.name}`;
                resolve(file);
            }
        });
    })
})).merge({
    [':' + idField]: {
        download: {
            get: basicController.entity.view({
                model,
                permission: permissions.view,
                idField,
                validate: (v, req) => v.isInteger(req.params[idField], idField),
                processResults: (file, req) => req.query.width || req.query.height
                    ? sharp(Buffer.from(file.data, 'base64'))
                        .resize(+req.query.width || null, +req.query.height || null)
                        .background({r: 0, g: 0, b: 0, alpha: 0})
                        .embed()
                        .toFormat(sharp.format.png)
                        .toBuffer()
                    : Buffer.from(file.data, 'base64'),
                raw: true,
                contentType: file => file.mime
            })
        }
    }
}).raw;
