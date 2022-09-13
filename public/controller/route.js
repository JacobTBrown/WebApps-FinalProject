import { tictactoe_page } from '../viewpage/tictactoe_page.js';
import { about_page } from '../viewpage/about_page.js';

export const routePath = {
    TICTACTOE: '/tictactoe',
    ABOUT: '/about',
}

export const routes = [
    {path: routePath.TICTACTOE, page: tictactoe_page},
    {path: routePath.ABOUT, page: about_page},
];

export function routing(pathname, hash) {
    const route = routes.find(element => element.path == pathname);
    if (route) route.page();
    else routes[0].page();
}