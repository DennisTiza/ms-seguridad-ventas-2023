import {AuthenticationStrategy, AuthenticationBindings, AuthenticationMetadata} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {AuthService, SeguridadUsuarioService} from '../services';
import {repository} from '@loopback/repository';
import {RolMenuRepository} from '../repositories';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private servicioSeguridad: SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata[],
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository,
    @service(AuthService)
    private servicioAuth: AuthService
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
      let idMenu: string = this.metadata[0].options![0];
      let accion: string = this.metadata[0].options![1];
      console.log(this.metadata);
      try {
        let res = await this.servicioAuth.VerificarPermisoDeusuarioPorRol(idRol, idMenu, accion);
        return res;
      } catch (e) {
        throw e;
      }
    }
    throw new HttpErrors[401]("No es posible realizar la accion por falta de un token");
  }
}
