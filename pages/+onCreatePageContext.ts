// import api from "../api/SublymusApi";

export { onCreatePageContext }
 
async function onCreatePageContext(pageContext:any) {
   console.log(pageContext.headers);
   
   const serverUrl = (pageContext.headers as any)?.['x-server-url'] as string;
   const serverApiUrl = (pageContext.headers as any)?.['x-server-api-url'] as string;
   pageContext.serverUrl = serverUrl;
   pageContext.serverApiUrl = serverApiUrl;
   console.log('**********************',{serverApiUrl,serverUrl});   
   // api.setBaseUrl(serverApiUrl);
}
