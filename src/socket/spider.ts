import axios from 'axios'
import * as dayjs from "dayjs";

const cheerio = require('cheerio');

export async function getKl8Data(game?: any) {
    const res = await axios.get('http://www.dashen28.com/xingyun28/lishi/');
    const $ = cheerio.load(res.data);
    const trs = $('.list tbody tr');
    const data = [];
    trs.each((item, dex) => {
        const tds = $(dex).find('td');
        const open: any = {
            expect: '',
            time: 0,
            date: '',
            codes: '',
            gameId: game && game.id
        };
        tds.each((i, td) => {
            const html = $(td).text().trim();//.replace(/\ /g, '')
            if (i === 0) open.expect = html;//开奖期数
            if (i === 1) {
                open.date = dayjs().year() + '-' + html;
                open.time = dayjs(open.date).unix();
            }
            if (i === 2) open.codes = html.split('=')[0].replace(/[\ |\=]/g, '').replace(/\+/g, ',');
        });
        data.push(open)
    });
    return data;
}
