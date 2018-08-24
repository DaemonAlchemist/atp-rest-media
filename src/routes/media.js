
import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import File from "../model/file";
import randomstring from 'randomstring';
import {s3} from "../util";
import {_} from 'atp-pointfree';

const model = File;
const permissions = createCrudPermissions('media', 'file');
const idField = 'fileId';

const uploadFile = file => {
    file.s3Prefix = randomstring.generate({length: 8, readable: true});
    const fileNameFull = file.s3Prefix + " - " + file.fileName + "." + file.fileExtension;
    return s3().upload(fileNameFull, file.data).then(() => {
        delete file.data;
        return file;
    });
}

const deleteS3Files = id => new model().getById(id)
    .then(_(s3().listObjects, media => `${media.s3Prefix ? media.s3Prefix + " - " : ""}${media.fileName}`))
    .then(s3().deleteObjects);

export default basicController.entity.crud({
    model, permissions, idField,
    validateCreate: v => v,
    preInsert: uploadFile,
    preUpdate: (file, id) => file.data
        ? uploadFile(file).then(file => deleteS3Files(id).then(() => file))
        : Promise.resolve(file),
    preDelete: req => deleteS3Files(req.params[idField])
});
