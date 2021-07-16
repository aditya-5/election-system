// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "http://localhost:3000/",
  firebaseConfig : {
    apiKey: "AIzaSyByWzX-WaULsC7J1CBjP-omROIXgNwdB0Y",
    authDomain: "election-system-db247.firebaseapp.com",
    databaseURL: "https://election-system-db247-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "election-system-db247",
    storageBucket: "election-system-db247.appspot.com",
    messagingSenderId: "629690985467",
    appId: "1:629690985467:web:097102df60269720fbf95e",
    measurementId: "G-8D9081QGKB"
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
