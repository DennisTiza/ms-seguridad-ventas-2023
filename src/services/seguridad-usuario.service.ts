import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {Credenciales, Usuario} from '../models';
import {repository} from '@loopback/repository';
import {UsuarioRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require("crypto-js/md5");

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    public repositorioUsuario: UsuarioRepository
  ) { }

  /*
   * Crear una clave aleatoria
   */
  crearTextoAleatorio(n: number): string {
    let clave = generator.generate({
      length: 10,
      numbers: true
    });
    return clave;
  }
  /***
   * cadena Texto a cifrar
   */

  cifrarTexto(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada
  }
  /***
   * se busca un usuario por sus credenciales de acceso
   * @param credenciales credenciales del usuario
   * @returns usuario encontrado o null
   */

  async identificarUsuario(credenciales: Credenciales): Promise<Usuario | null> {
    let usuario = await this.repositorioUsuario.findOne({
      where: {
        correo: credenciales.correo,
        clave: credenciales.clave
      }
    });
    return usuario as Usuario;
  }

}
