
export enum AssetTypeEnum {

  UNKNOWN = 'UNKNOWN',

  PAGE = 'PAGE', // application/xml
  FOLDER = 'FOLDER', // application/octet-stream
  COMPONENT = 'COMPONENT',
  DOCUMENT = 'DOCUMENT',
  ASSET = 'ASSET', // many (css, js, ...)
  LEVEL_DESCRIPTOR = 'LEVEL_DESCRIPTOR', // application/xml

  // Images
  SVG = 'svg image',
  JPEG = 'jpeg image',
  GIF = 'gif image',
  PNG = 'png image',

  // Video
  MP4 = 'mp4 video',

  // AUDIO
  MPEG = 'audio mpeg',

  // Web Code
  JAVASCRIPT = 'javascript',
  GROOVY = 'groovy',
  CSS = 'stylesheet',
  SCSS = 'sass stylesheet',
  LESS = 'less stylesheet',
  FREEMARKER = 'freemarker template',
  // Fonts
  EOT_FONT = 'eot font',
  OTF_FONT = 'otf font',
  TTF_FONT = 'ttf font',
  WOFF_FONT = 'woff font',
  WOFF2_FONT = 'woff2 font',

}
