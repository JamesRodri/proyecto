import { Component, OnInit } from "@angular/core";

import { Observable } from "rxjs";
import { AutorInt } from "src/app/services/database.service";
import { DatabaseService } from "./../../services/database.service";

import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-autores",
  templateUrl: "./autores.page.html",
  styleUrls: ["./autores.page.scss"]
})
export class AutoresPage implements OnInit {
  autores: AutorInt[] = [];

  libros: Observable<any[]>;

  autor = {};
  libro = {};

  selectedView = "autors";

  constructor(
    private db: DatabaseService,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getAutores().subscribe(autors => {
          console.log("iniciando la bd ", autors);
          this.autores = autors;
        });
        this.libros = this.db.getLibros();
      }
    });
  }

  addAutorP() {
    this.db
      .addAutor(this.autor["nombre"], this.autor["genero"], this.autor["img"])
      .then(_ => {
        this.autor = {};
      });
  }

  addLibroP() {
    this.db.addLibro(this.libro["titulo"], this.libro["autorId"]).then(_ => {
      this.libro = {};
    });
  }

  deleteAutorP(id) {
    this.db.deleteAutor(id).then(_ => {
      console.log("Eliminado Autor");
    });
  }

  deleteLibroP(id) {
    this.db.deleteLibro(id).then(_ => {
      console.log("Eliminado Libro");
    });
  }

  editAutorP(id) {
    this.db.getAutor(id).then(autor => {
      this.presentAlertAutor(autor);
    });
  }

  editLibroP(id) {
    this.db.getLibro(id).then(libro => {
      this.presentAlertLibro(libro);
    });
  }

  async presentAlertAutor(autor) {
    const alert = await this.alertController.create({
      header: "Modificar Autor",
      inputs: [
        {
          label: "Nombre:",
          value: autor.nombre,
          name: "autorNombre",
          type: "text",
          placeholder: "Nombre de Autor"
        },
        {
          label: "Genero:",
          value: autor.genero,
          name: "autorGenero",
          type: "text",
          placeholder: "Genero de libro de Autor"
        },
        {
          label: "Foto:",
          value: autor.img,
          name: "autorImg",
          type: "text",
          placeholder: "Foto de Autor"
        }
      ],
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          }
        },
        {
          text: "Modificar",
          cssClass: "warning",
          handler: e => {
            this.db
              .updateAutor({
                id: autor.id,
                nombre: e.autorNombre,
                genero: e.autorGenero,
                img: e.autorImg
              })
              .then(_ => {
                console.log("Autor modificado");
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertLibro(libro) {
    const alert = await this.alertController.create({
      header: "Modificar Libro (Solo titulo)",
      inputs: [
        {
          label: "Nombre:",
          value: libro.titulo,
          name: "libroTitulo",
          type: "text",
          placeholder: "Titulo Libro"
        }
      ],
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          }
        },
        {
          text: "Modificar",
          cssClass: "warning",
          handler: e => {
            this.db
              .updateLibro({
                id: libro.id,
                titulo: e.libroTitulo,
                autorId: libro.autorId
              })
              .then(_ => {
                console.log("Libro modificado");
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
