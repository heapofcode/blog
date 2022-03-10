import { ICategory } from "./category";
import { ITag } from "./tag";

export interface IArticle
{
  id:string;
  name:string;
  shortDescription:string;
  description:string;
  heroImage:string;
  categoryId:string;
  category:ICategory
  tags:ITag[];
  date:Date;
}
