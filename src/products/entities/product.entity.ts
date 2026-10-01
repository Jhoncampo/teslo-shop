import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '8b89a440-8345-4056-b465-3b8f17f1b308',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

   @ApiProperty({
    example: 'T-shirt Teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title!: string;

  @ApiProperty({
    example: 0,
    description: 'Product Price',
  })
  @Column('float', {
    default: 0,
  })
  price!: number;

   @ApiProperty({
    example: 'Occaecat ipsum amet incididunt culpa laborum proident ut ut cillum fugiat laborum esse Lorem ullamco.',
    description: 'Product Description',
    default: null
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string;

   @ApiProperty({
    example: 't-shirt-teslo',
    description: 'Product slug',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug!: string;

   @ApiProperty({
    example: 1000,
    description: 'Product stock',
    default: 0
  })
  @Column('int', {
    default: 0,
  })
  stock!: number;

   @ApiProperty({
    example: ["S", "M", "XL"],
    description: 'Product Sizes',
  })
  @Column('text', {
    array: true,
  })
  sizes!: string[];

   @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  @Column('text')
  gender!: string;

  @ApiProperty()
  @Column('text', {
    array: true,
    default: [],
  })
  tags!: string[];

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user!: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll("'", '');
  }
}
