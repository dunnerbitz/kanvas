import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard.js';
import {
  FILE_MAX_BYTES,
  MAX_FILE_UPLOADS_PER_CALL,
  ALLOWED_FILE_MIMETYPES,
} from '../../constants.js';
import { NftEntity, NftUpdate } from '../entities/nft.entity.js';
import { NftService } from '../service/nft.service.js';
import { CurrentUser } from '../../decoraters/user.decorator.js';
import { UserEntity } from '../../user/entities/user.entity.js';
import { NftFilterParams, NftFilters } from '../params.js';
import { ParseJSONArrayPipe } from '../../pipes/ParseJSONArrayPipe.js';
import {
  queryParamsToPaginationParams,
  validatePaginationParams,
} from '../../utils.js';

function pngFileFilter(req: any, file: any, callback: any) {
  if (
    !ALLOWED_FILE_MIMETYPES.some(
      (mimeAllowed: string) => file.mimetype === mimeAllowed,
    )
  ) {
    req.fileValidationError = 'Invalid file type';
    return callback(new Error(`Invalid file type: ${file.mimetype}`), false);
  }

  return callback(null, true);
}

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get('/attributes')
  @UseGuards(JwtAuthGuard)
  getAttributes() {
    return this.nftService.getAttributes();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() filters: NftFilters,
    @Query('sort', new ParseJSONArrayPipe())
    sort?: string[],
    @Query('range', new ParseJSONArrayPipe())
    range?: number[],
  ) {
    const params = this.#queryParamsToFilterParams(filters, sort, range);

    validatePaginationParams(params, this.nftService.getSortableFields());

    return await this.nftService.findAll(params);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number, @CurrentUser() user: UserEntity) {
    return await this.nftService.getNft(user, id);
  }

  @UseInterceptors(
    FilesInterceptor('files[]', MAX_FILE_UPLOADS_PER_CALL, {
      fileFilter: pngFileFilter,
      limits: {
        fileSize: FILE_MAX_BYTES,
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  @Patch(':id?')
  async update(
    @Body() nftUpdatesBody: any,
    @CurrentUser() user: UserEntity,
    @Param() urlParams: any,
    @UploadedFiles() filesArray?: any[],
  ): Promise<NftEntity> {
    let nftId = urlParams.id;

    if (typeof nftId === 'undefined') {
      nftId = (await this.nftService.createNft(user)).id;
    }
    const nftUpdates = this.#transformFormDataToNftUpdates(
      nftUpdatesBody,
      filesArray,
    );

    return await this.nftService.applyNftUpdates(user, nftId, nftUpdates);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@CurrentUser() user: UserEntity, @Param('id') nftId: number) {
    return await this.nftService.deleteNft(user, nftId);
  }

  #transformFormDataToNftUpdates(nftUpdatesBody: any, filesArray?: any[]) {
    const res: NftUpdate[] = [];

    for (const attr of Object.keys(nftUpdatesBody)) {
      res.push(<NftUpdate>{
        attribute: attr,
        value: nftUpdatesBody[attr],
      });
    }

    if (typeof filesArray !== 'undefined') {
      for (const file of filesArray) {
        res.push(<NftUpdate>{
          attribute: file.originalname,
          file: file,
        });
      }
    }

    return res;
  }

  #queryParamsToFilterParams(
    filters?: NftFilters,
    sort?: string[],
    range?: number[],
  ): NftFilterParams {
    return {
      ...new NftFilterParams(),
      ...queryParamsToPaginationParams(sort, range),
      filters: filters,
    };
  }
}
