import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** Groups with nested products — used by ShopPage / Products section. */
  @Get('product-groups')
  getGroups() {
    return this.productsService.findAllGroups();
  }

  /** Flat list of active products. */
  @Get('products')
  getProducts() {
    return this.productsService.findAllProducts();
  }

  /** Single product by slug — used by ProductDetailsPage. */
  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
