import { Injectable } from '@nestjs/common';
import { initialData } from './data/seed-data';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}

  async runSeed() {
    await this.insertNewProducts();
    return `seed executed`;
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = products.map((product)=> this.productService.create(product))

    // products.forEach((product) => {
    //   insertPromises.push(this.productService.create(product))
    // })
    await Promise.all(insertPromises);

    return true;
  }
}
