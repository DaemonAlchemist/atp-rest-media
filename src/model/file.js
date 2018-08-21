/**
 * Created by Andrea on 8/27/2017.
 */

import {Entity} from 'atp-active-record';
import {filterOnTags} from 'atp-rest-tag';

export default class File extends Entity
{
    constructor() {
        super('media', 'atpmedia_media');
    }

    filter(filters) {
        return super.filter(filterOnTags(this, filters, 'mediaFile'));
    }
}
