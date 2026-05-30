import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_groups')
export class ProductGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** URL-friendly identifier, e.g. 'core-honey', 'supplements' */
  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  /** Layout hint consumed by the frontend grid renderer */
  @Column({ default: 'grid' })
  layout: 'grid' | 'lab';

  /** lucide-react icon name string (e.g. 'Droplets', 'Sparkles') */
  @Column({ nullable: true })
  iconName: string;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => Product, (product) => product.group)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
