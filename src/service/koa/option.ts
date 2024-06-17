import Koa from 'koa';

export type KoaOption = (app: Koa) => void;