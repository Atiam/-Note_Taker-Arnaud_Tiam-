
// 
const express = require('express');
const path = require('path');
const fs = require(`fs`);
const app = express();

app.use(express.static('public'));

const PORT = process.env.PORT || 3003;

const notesData = require("./db/db.json");


//Helper methode for generating unique ids.
const uuId = require(`./helpers/uuid.js`)

app.get("/", (req, res) => res.send("Go to /api/note for the API!"))




//Middlewares______________________________________

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Static assets
app.use(express.static(`public`));

//ROUTES________________________________________________

  //GET - index homepage__________________________________________
        app.get(`/`, (req, res) => {
            res.sendFile(path.join(__dirname, `/public/index.html`))
        });

    //Get - notes.html____________________________________________

        app.get(`/notes`, (req, res) => {
            res.sendFile(path.join(__dirname, `/public/notes.html`))
        });

    // GET - api notes_______________________________________

    app.get('/api/notes', (req, res)=>{
        
    fs.readFile(`./db/db.json`, `utf8`, (err, data) => {
        if(err){
            console.error(err);
            res.status(500).json(`Error reading data`);
        }

        else {res.json(notesData);

        }
    });
        
    });
    

        
 //Get - api note by id ________________________________________________
    app.get('/api/notes/:id', (req, res) => {
        const noteId = req.params.id;

        fs.readFile('./db/db.json', 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read file' });
          }
          else {
            // Iterate through the terms name to check if it matches `req.params.id`
                for (let i = 0; i < notesData.length; i++) {
                    if (noteId === notesData[i].id) {
                    return res.json(notesData[i]);
                    }
                }        
            // Return a message if the term doesn't exist in our DB
                return res.json('No match found');
        }
    });
});

//POST -To add notes _____________________________________________________________

app.post('/api/notes', (req, res) => {
    //Log that a POST request was received
    console.info(`${req.method} request received to add a review`);

    const newNote = {
      id: uuId(),
      title: req.body.title,
      text: req.body.text
    };

    // Push the newnote (newly collected node) into db.json (nodesData).
    notesData.push(newNote);

    //To read and write to db.json

    // 1. Readd the db.json and parse data
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      const notes = JSON.parse(data);

      // 2. add the new note to the list of notes (db.json)
      notes.push(newNote);
      console.log(notes);

      // 3. Write the updated list to the db.json
      
      fs.writeFile('./db/db.json', JSON.stringify(notes, "", 4), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        res.json(newNote);
      });
    });
  })


// DELETE ____________________
app.delete(`/api/notes/:id`, (req, res) => {
    const noteId = req.params.id;

    //Read all notes from the db.json file
    fs.readFile(`./db/db.json`, `utf8`, (err, data) => {
        if(err){
            console.error(err);
            return res.status(500).json(`Error reading data`);
        }

        //Remove the note with the given id property
        let notes = JSON.parse(data);
        NewNodeObj = notes.filter(note => note.id !== noteId); 
        
          
        //Write to db.json the remaining notes after deletion
        fs.writeFile('./db/db.json', JSON.stringify(NewNodeObj, "", 4), (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json(`Error Writting data`);
            }
            res.json(`Note with id ${noteId} has been deleted`);
    })
})

})

  
// Get Fallback route
app.get(`*`, (req, res) => {res.sendFile(path.join(__dirname, `public/404.html`))

});


// Add a listener
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));