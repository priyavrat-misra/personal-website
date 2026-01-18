import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano'

const purgecss = purgeCSSPlugin({
    content: ["./hugo_stats.json"],
    defaultExtractor: (content) => {
        const els = JSON.parse(content).htmlElements;
        return [...(els.tags || []), ...(els.classes || []), ...(els.ids || [])];
    },
    safelist: [
        /\[open\]/,
    ],
});

export default {
    plugins: [
        ...(process.env.HUGO_ENVIRONMENT === "production" ? [purgecss] : []),
        autoprefixer,
        cssnano({
            preset: [
                "default",
                { "discardComments": { "removeAll": true } }
            ]
        })
    ],
};
