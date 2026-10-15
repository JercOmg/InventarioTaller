/** Error de aplicación con código HTTP asociado. */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly detalle?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, detalle?: unknown) {
    return new ApiError(400, message, detalle);
  }
  static noAutorizado(message = 'No autenticado') {
    return new ApiError(401, message);
  }
  static prohibido(message = 'No tiene permisos para realizar esta acción') {
    return new ApiError(403, message);
  }
  static noEncontrado(message = 'Recurso no encontrado') {
    return new ApiError(404, message);
  }
  static conflicto(message: string, detalle?: unknown) {
    return new ApiError(409, message, detalle);
  }
}
