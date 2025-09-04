var environment = "testing"  // 1)testing 2)staging 3)production
var baseurl = ""
var baseApiUploadsUrl = ""
 
if (environment == "testing") {
    baseurl = "https://openapi.fotoowl.ai/open/event";
    baseApiUploadsUrl = "https://openapi.fotoowl.ai/open/event";
}
if (environment == "staging") {
    baseurl = ''
    baseApiUploadsUrl = ''
}
if (environment == "production") {
    baseurl = ''
    baseApiUploadsUrl = ''
}
if (environment == "local") {
    baseurl = ''
    baseApiUploadsUrl = ''
}
 
export const baseApi = baseurl;
export const baseApiUploads = baseApiUploadsUrl