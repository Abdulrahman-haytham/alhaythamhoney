import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductGroup } from './entities/product-group.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductGroup)
    private readonly groupsRepo: Repository<ProductGroup>,
  ) {}

  /** All groups with their active products, ordered for display. */
  async findAllGroups(): Promise<ProductGroup[]> {
    const groups = await this.groupsRepo.find({
      relations: ['products'],
      order: { sortOrder: 'ASC' },
    });

    // Keep only active products and sort them within each group
    return groups.map((group) => ({
      ...group,
      products: (group.products ?? [])
        .filter((p) => p.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  }

  /** Flat list of active products. */
  findAllProducts(): Promise<Product[]> {
    return this.productsRepo.find({
      where: { isActive: true },
      relations: ['group'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { slug, isActive: true },
      relations: ['group'],
    });
    if (!product) {
      throw new NotFoundException(`Product '${slug}' not found`);
    }
    return product;
  }
}
