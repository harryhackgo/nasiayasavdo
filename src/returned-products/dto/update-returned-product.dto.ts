import { PartialType } from '@nestjs/swagger';
import { CreateReturnedProductDto } from './create-returned-product.dto';

export class UpdateReturnedProductDto extends PartialType(CreateReturnedProductDto) {}
