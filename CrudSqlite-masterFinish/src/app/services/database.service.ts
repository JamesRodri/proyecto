import { Injectable } from "@angular/core";
import { SQLitePorter } from "@ionic-native/sqlite-porter/ngx";
import { HttpClient } from "@angular/common/http";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { BehaviorSubject, Observable } from "rxjs";
import { Platform } from "@ionic/angular";

export interface AutorInt {
  id: number;
  nombre: string;
  genero: string;
  img: string;
}

@Injectable({
  providedIn: "root"
})
export class DatabaseService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  autores = new BehaviorSubject([]);
  libros = new BehaviorSubject([]);

  constructor(
    private plt: Platform,
    private sqlitePorter: SQLitePorter,
    private sqlite: SQLite,
    private http: HttpClient
  ) {
    this.plt.ready().then(() => {
      this.sqlite
        .create({
          name: "autores.db",
          location: "default"
        })
        .then((db: SQLiteObject) => {
          this.database = db;
          this.seedDatabase();
        });
    });
  }

  seedDatabase() {
    this.http
      .get("assets/mySql.sql", { responseType: "text" })
      .subscribe(sql => {
        this.sqlitePorter
          .importSqlToDb(this.database, sql)
          .then(_ => {
            this.loadAutores();
            this.loadLibros();
            this.dbReady.next(true);
          })
          .catch(e => console.error(e));
      });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }

  getAutores(): Observable<AutorInt[]> {
    return this.autores.asObservable();
  }

  getLibros(): Observable<any[]> {
    return this.libros.asObservable();
  }

  loadAutores() {
    return this.database.executeSql("SELECT * FROM autor", []).then(data => {
      let autores: AutorInt[] = [];

      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          autores.push({
            id: data.rows.item(i).id,
            nombre: data.rows.item(i).nombre,
            genero: data.rows.item(i).genero,
            img: data.rows.item(i).img
          });
        }
      }
      this.autores.next(autores);
    });
  }

  loadLibros() {
    let query =
      "SELECT obra.titulo, obra.id, autor.nombre AS autor_nombre FROM obra JOIN autor ON autor.id = obra.autorId";
    return this.database.executeSql(query, []).then(data => {
      let books = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          books.push({
            id: data.rows.item(i).id,
            titulo: data.rows.item(i).titulo,
            autor_nombre: data.rows.item(i).autor_nombre
          });
        }
      }
      this.libros.next(books);
    });
  }

  addAutor(nombre, genero, img) {
    let data = [nombre, genero, img];
    return this.database
      .executeSql(
        "INSERT INTO autor (nombre, genero, img) VALUES (?, ?, ?)",
        data
      )
      .then(data => {
        this.loadAutores();
      });
  }

  getAutor(id): Promise<AutorInt> {
    return this.database
      .executeSql("SELECT * FROM autor WHERE id = ?", [id])
      .then(data => {
        return {
          id: data.rows.item(0).id,
          nombre: data.rows.item(0).nombre,
          genero: data.rows.item(0).genero,
          img: data.rows.item(0).img
        };
      });
  }

  deleteAutor(id) {
    return this.database
      .executeSql("DELETE FROM autor WHERE id = ?", [id])
      .then(_ => {
        this.loadAutores();
        this.loadLibros();
      });
  }

  updateAutor(autorx: any) {
    let data = [autorx.nombre, autorx.genero, autorx.img];
    return this.database
      .executeSql(
        `UPDATE autor SET nombre = ?, genero = ?, img = ? WHERE id = ${autorx.id}`,
        data
      )
      .then(data => {
        this.loadAutores();
      });
  }

  addLibro(tituloy, autory) {
    let data = [tituloy, autory];
    console.log(tituloy, "   ", autory);
    return this.database
      .executeSql("INSERT INTO obra (titulo, autorId) VALUES (?, ?)", data)
      .then(data => {
        this.loadLibros();
      });
  }

  getLibro(id): Promise<any> {
    return this.database
      .executeSql("SELECT * FROM obra WHERE id = ?", [id])
      .then(data => {
        return {
          id: data.rows.item(0).id,
          titulo: data.rows.item(0).titulo,
          autorId: data.rows.item(0).autorId
        };
      });
  }

  deleteLibro(id) {
    return this.database
      .executeSql("DELETE FROM obra WHERE id = ?", [id])
      .then(_ => {
        this.loadAutores();
        this.loadLibros();
      });
  }

  updateLibro(libro: any) {
    let data = [libro.titulo, libro.autorId];
    return this.database
      .executeSql(
        `UPDATE obra SET titulo = ?, autorId = ? WHERE id = ${libro.id}`,
        data
      )
      .then(data => {
        this.loadLibros();
      });
  }
}
