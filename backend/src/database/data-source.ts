import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { Product } from '../modules/products/entities/product.entity';
import { ProductGroup } from '../modules/products/entities/product-group.entity';
import { Article } from '../modules/articles/entities/article.entity';

loadEnv();

/**
 * Standalone TypeORM DataSource — used by the seed script and the TypeORM CLI
 * for generating/running migrations outside the Nest runtime.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME || 'alhaytham_honey',
  username: process.env.DB_USER || 'alhaytham_user',
  password: process.env.DB_PASSWORD || 'change_me_secure_password',
  entities: [Product, ProductGroup, Article],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});
