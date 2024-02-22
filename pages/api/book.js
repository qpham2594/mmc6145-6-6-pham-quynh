import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "../../config/session"
import db from '../../db'

// this handler runs for /api/book with any request method (GET, POST, etc)
export default withIronSessionApiRoute(
  async function handler(req, res) {
    // TODO: On a POST request, add a book using db.book.add with request body (must use JSON.parse)
    // TODO: On a DELETE request, remove a book using db.book.remove with request body (must use JSON.parse)
    // TODO: Respond with 404 for all other requests
    // User info can be accessed with req.session
    // No user info on the session means the user is not logged in
    /*
    POST tests:
      should add book if user logged in
    DELETE test:
      should remove book if user logged in  
    */
    const { user } = req.session

   /* const props = {}
    if (user) {
      props.user = req.session.user;
      const book = await db.book.getByGoogleId(req.session.user.id, params.id)
      if (book) {
        props.book = book
      }
      return {props}
    } */
      try {
        if (!user || !req.session) {
          return res.status(401).json({ error: "Unauthorized - User not logged in" });
        }
   
        if (user && req.method === "POST") {
          try {
            const book = JSON.parse(req.body);
             const addedBook = await db.book.add([user.id, book]);
             if (addedBook) {
              return res.status(200).json({ "Book is added": addedBook })
             } else {
              req.session.destroy()
              return res.status(401).json({ error: "Book not added" });
             }
          } catch (error) {
            console.error("Error adding a book:", error);
            return res.status(400).json({ error: error.message });
          }
        } else if ( user && req.method === "DELETE") {
          try {
            const book = JSON.parse(req.body);
   
            if (!user) {
              req.session.destroy();
              return res.status(401).json("No user is found");
            }
   
            const removingBook = await db.book.remove([user.id, book.id]);
   
            if (removingBook) {
              return res.status(200).json({ "Book is removed": removingBook });
            } else {
              req.session.destroy()
              return res.status(401).json({ error: "Book not found" });
            }
          } catch (error) {
            console.error("Error removing book:", error);
            return res.status(400).json({ error: error.message });
          }
        } else {
          return res.status(404).end();
        }
      } catch (error) {
          console.error("Session error:", error);
          return res.status(500).json({ error: "Internal Server Error" });
      }
  },
    sessionOptions
);