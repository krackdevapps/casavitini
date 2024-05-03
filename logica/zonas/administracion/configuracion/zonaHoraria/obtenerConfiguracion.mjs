export const obtenerConfiguracion = async (entrada, salida) => {
                    try {
                        const consultaConfiguracionGlobal = `
                            SELECT 
                            *
                            FROM 
                            "configuracionGlobal"
                            WHERE
                            "configuracionUID" = $1
                            `;
                        const configuracionUID = [
                            "zonaHoraria"
                        ];
                        const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID);
                        if (resuelveConfiguracionGlobal.rowCount === 0) {
                            const error = "No hay configuraciones globales";
                            throw new Error(error);
                        }
                        const listaZonasHorarias = zonasHorarias();
                        const ok = {
                            ok: resuelveConfiguracionGlobal.rows[0],
                            listaZonasHorarias: listaZonasHorarias
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error);
                    }

                }