import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({example: "7c363f57-0cd7-4b0e-9455-a37d76320720"})
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({example: "Jhon Campo"})
  @Column('text')
  fullName!: string;

  @ApiProperty({uniqueItems: true,example:"test@gmail.com", description: "Email is unique"})
  @Column('text', { unique: true })
  email!: string;

  @ApiProperty()
  @Column('text', { select: false })
  password!: string;

  @ApiProperty({example: "true"})
  @Column('bool', { default: true })
  isActive!: boolean;
@ApiProperty({example: ["user", "admin"]})
  @Column('text', { array: true, default: ['user'] })
  roles!: string[];

  @OneToMany(() => Product, (product) => product.user)
  product!: Product;

  @BeforeInsert()
  checkFielsdBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFielsdBeforeInsert();
  }
}
