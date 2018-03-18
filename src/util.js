
import config from 'atp-config';
import AWS from 'aws-sdk';

export const s3 = () => {
    const awsConfig = config.get('media.aws');
    AWS.config.update({region: awsConfig.region})
    const _s3 = new AWS.S3({params: {Bucket: awsConfig.bucket}});

    return {
        upload: (key, file) => new Promise((resolve, reject) => {
            _s3.upload({
                Key: key,
                Body: Buffer.from(file, 'base64'),
                ACL: 'public-read',
            }, (err, data) => {
                if(err) {
                    reject(err.message)
                } else {
                    resolve();
                }
            });
        }),
        listObjects: Prefix => new Promise((resolve, reject) => {
            _s3.listObjects({
                Prefix
            }, (err, data) => {
                if(err) {
                    reject(err.message);
                } else {
                    resolve(data.Contents);
                }
            })
        }),
        deleteObjects: objects => new Promise((resolve, reject) => {
            if(objects.length === 0) {
                resolve();
                return;
            }
            _s3.deleteObjects({
                Delete: {Objects: objects.map(({Key}) => ({Key}))}
            }, (err, data) => {
                if(err) {
                    reject(err.message);
                } else {
                    resolve();
                }
            })
        })
    }
};
