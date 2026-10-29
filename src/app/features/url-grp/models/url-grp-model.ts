import { UrlModel } from "@features/url/models/url-model";

export interface SaveUrlGrpModel {
  name: string;
  is_enabled: boolean;
}

export interface UrlGrpModel extends SaveUrlGrpModel {
  id_urlgrp: number;
  created_at: string;
  updated_at: string;
}

export interface UrlGrpDetailModel extends UrlGrpModel {
  urls: UrlModel[];
}
