import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { Product } from './modules/products/entities/product.entity';
import { ProductGroup } from './modules/products/entities/product-group.entity';
import { Article } from './modules/articles/entities/article.entity';
import { ProductsModule } from './modules/products/products.module';
import { ArticlesModule } from './modules/articles/articles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        database: config.get<string>('database.name'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        entities: [Product, ProductGroup, Article],
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<string>('nodeEnv') === 'development',
        ssl:
          config.get<string>('nodeEnv') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    ProductsModule,
    ArticlesModule,
  ],
})
export class AppModule {}
