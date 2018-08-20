/**
 * Created by Andrea on 8/27/2017.
 */

import {Entity} from 'atp-active-record';
import {remove} from "atp-pointfree";

export default class File extends Entity
{
    constructor() {
        super('media', 'atpmedia_media');
    }

    filter(filters) {
        const tags = [].concat(filters.tag || []);
        filters = remove("tag")(filters);
        console.log("Media filters: ");
        console.log(filters);
        console.log("Media tags");
        console.log(tags);

        if(tags.length > 0) {
            this.where(`id in (select entityId from atptag_entity_tag_compiled where entityType="mediaFile" and tag in (${tags.map(tag => `"${tag}"`).join(",")}))`);
        }

        return super.filter(filters);
    }
}
