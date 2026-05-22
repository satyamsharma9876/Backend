import multer from "multer";// multer pkg import kiya iska kaam file upload krne ka h

const storage = multer.diskStorage({//here we tell upload file kha uploaded hogi,server k disk/folder me upload hogi
  destination: function (req, file, cb) {// this req is request coming from user either from frontend or postman,file is uploaded file ki info, cb is callback fn
    cb(null, "./public/temp");// file ./public/temp folder me save hogi
  },
  filename: function (req, file, cb) {// ye decide krta h file kis naam se save hogi
    console.log(file);// uploaded file ki puri info print kro
    cb(null, file.originalname)// file usi original name se save hogi
  },
});

export const upload = multer({ // yha multer middleware banaya ja rha h
    storage,// Multer ko bataya ja rha h ki uper vala storage config use kro
 })// Multer setup complete


// agar frontend se form-data me fie aayegi to Express use manually read nhi kr pata kyuki vo JSON read pata hai isilye multer ki jarurat padti h 

// flow:
// frontend sends file then,
// multer middleware,
// temp folder me save,
// controler access karega

