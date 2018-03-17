/**
 * Created by Andy on 8/25/2017.
 */

import mediaRoutes from './routes/media';
import fileRoutes from "./routes/file";
import File from './model/file';

//import validators from "./validators/index";

export default ({
    routes: {
        media: mediaRoutes,
        file: fileRoutes
    },
    config: {
        //validators
    }
});

export {File};
