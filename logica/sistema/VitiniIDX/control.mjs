export class VitiniIDX {
    constructor(session, salida) {
        this.usuario = session.usuario;
        this.rol = session.rol;
        this.salida = salida
        this.contenedorGrupos = [];
    }
    administradores() {
        this.contenedorGrupos.push("administrador");
    }
    empleados() {
        this.contenedorGrupos.push("empleado");
    }
    clientes() {
        this.contenedorGrupos.push("cliente");
    }
    control() {
        try {
            const VitiniIDX = this.usuario;
            if (!VitiniIDX) {
                 const msgError = {
                    tipo: "IDX",
                    mensaje: "Tienes que identificarte para seguir"
                };
                throw msgError
            }
            if (this.contenedorGrupos.length > 0) {
                const rol = this.rol;
                if (!this.contenedorGrupos.includes(rol)) {
                    const msgError = {
                        tipo: "ROL",
                        mensaje: "No estás autorizado, necesitas una cuenta de más autoridad para acceder aquí"
                    }
                    throw msgError
                }
            }
        } catch (errorCapturado) {
            throw errorCapturado
        }
    }
}