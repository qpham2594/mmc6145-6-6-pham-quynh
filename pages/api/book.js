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
    try {
      const { user } = req.session;
      if (!user || !req.session) {
        return res.status(401).json({ error: "Unauthorized - User not logged in" });
      }

      if (req.method === "POST") {
        try {
          const { title } = JSON.parse(req.body);
          const addBook = await db.book.add(user, { title });
          return res.status(200).json({ Book: addBook });
        } catch (error) {
          console.error("Error adding a book:", error);
          return res.status(400).json({ error: error.message });
        }
      } else if (req.method === "DELETE") {
        try {
          const { bookId } = JSON.parse(req.body);
          const myid = req.session.user.id;

          if (!user) {
            req.session.destroy();

            return res.status(401).json("No user is found");
          }

          const removingBook = await db.book.remove(myid, bookId);

          if (removingBook) {
            return res.status(200).json({ "Book is removed": removingBook });
          } else {
            return res.status(401).json({ success: false, error: "Book not found" });
          }
        } catch (error) {
          console.error("Error removing book:", error);
          return res.status(400).json({ error: error.message });
        }
      }
    } catch (error) {
      console.error("Session error:", error);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
  sessionOptions
);