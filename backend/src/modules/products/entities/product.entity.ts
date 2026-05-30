import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductGroup } from './product-group.entity';

export interface ProductDetailedInfo {
  uses?: string[];
  benefits?: string[];
  properties?: string[];
  howToUse?: string;
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Stable slug matching the legacy id and /product/:slug route */
  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'varchar', nullable: true })
  benefit: string | null;

  @Column({ type: 'varchar', nullable: true })
  badge: string | null;

  @Column()
  imageUrl: string;

  /** Cloudinary public_id (for future deletion/transformation) */
  @Column({ nullable: true })
  imagePublicId: string;

  /** Null until pricing is decided; orders negotiate via WhatsApp for now */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column('jsonb', { nullable: true })
  detailedInfo: ProductDetailedInfo | null;

  @ManyToOne(() => ProductGroup, (group) => group.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  group: ProductGroup;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
