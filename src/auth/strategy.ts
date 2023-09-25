import {AuthenticationStrategy, AuthenticationBindings, AuthenticationMetadata} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {SeguridadUsuarioService} from '../services';
import {repository} from '@loopback/repository';
import {RolMenuRepository} from '../repositories';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private servicioSeguridad: SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository
  ) { }

  /**
   * Autenticacion de usuario frente a una accion en la base de datos
   * @param request la solicitud con el token
   * @returns el perfil del usuario, undefined cuando no tiene permiso o un httpError
   */

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let token = parseBearerToken(request);
    if (token) {
      let idRol = this.servicioSeguridad.obtenerRolDesdeToken(token);
      let idMenu: string = this.metadata.options![0];
      let accion: string = this.metadata.options![1];

      let permiso = await this.repositorioRolMenu.findOne({
        where: {
          rolId: idRol,
          menuId: idMenu,
        }
      });
      let continuar: boolean = false;
      if (permiso) {
        switch (accion) {
          case "guardar":
            continuar = permiso.guardar;
            break;
          case "editar":
            continuar = permiso.editar;
            break;
          case "listar":
            continuar = permiso.listar;
            break;
          case "eliminar":
            continuar = permiso.eliminar;
            break;
          case "descargar":
            continuar = permiso.descargar;
            break;

          default:
            throw new HttpErrors[401]("No es posible ejecutar la accion porque no existe");
        }
        if (continuar) {
          let perfil: UserProfile = Object.assign({
            permitido: "OK"
          });
          return perfil;
        } else {
          return undefined;
        }
      } else {
        throw new HttpErrors[401]("No tiene permisos para realizar esta acción");
      }

    }
    throw new HttpErrors[401]("No es posible realizar la accion por falta de un token");
  }
}
