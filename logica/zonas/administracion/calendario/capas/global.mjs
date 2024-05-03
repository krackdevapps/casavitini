export const global = async (entrada, salida) => {
                    try {
                        const fecha = entrada.body.fecha;
                        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                        if (!filtroFecha.test(fecha)) {
                            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
                            throw new Error(error);
                        }
                        const constructorObjetoPorDias = (fecha) => {
                            const fechaArray = fecha.split("-");
                            const mes = fechaArray[0];
                            const ano = fechaArray[1];
                            const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
                            const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
                            const calendarioObjeto = {};
                            for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
                                const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`;
                                calendarioObjeto[llaveCalendarioObjeto] = [];
                            }
                            return calendarioObjeto;
                        };
                        const mesPorDias = constructorObjetoPorDias(fecha);
                        const estructuraGlobal = {
                            eventosMes: mesPorDias,
                            eventosEnDetalles: []
                        };
                        const eventosReservas_ = await eventosReservas(fecha);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosReservas_.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalles.push(...eventosReservas_.eventosEnDetalle);
                        const eventosTodosLosApartamentos_ = await eventosTodosLosApartamentos(fecha);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosApartamentos_.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalles.push(...eventosTodosLosApartamentos_.eventosEnDetalle);
                        const eventosTodosLosBloqueos_ = await eventosTodosLosBloqueos(fecha);
                        for (const [fechaDia, contenedorEventos] of Object.entries(eventosTodosLosBloqueos_.eventosMes)) {
                            const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                            selectorDia.push(...contenedorEventos);
                        }
                        estructuraGlobal.eventosEnDetalles.push(...eventosTodosLosBloqueos_.eventosEnDetalle);
                        // Obtengo todo los uids de los calendarios sincronizados en un objeto y lo itero
                        const plataformaAibnb = "airbnb";
                        const obtenerUIDCalendriosSincronizadosAirbnb = `
                                SELECT uid
                                FROM "calendariosSincronizados"
                                WHERE "plataformaOrigen" = $1
                                `;
                        const calendariosSincronizadosAirbnbUIDS = await conexion.query(obtenerUIDCalendriosSincronizadosAirbnb, [plataformaAibnb]);
                        if (calendariosSincronizadosAirbnbUIDS.rowCount > 0) {
                            const calendariosUIDS = calendariosSincronizadosAirbnbUIDS.rows.map((calendario) => {
                                return calendario.uid;
                            });
                            for (const calendarioUID of calendariosUIDS) {
                                const metadatosEventos = {
                                    fecha: fecha,
                                    calendarioUID: String(calendarioUID)
                                };
                                const eventosPorApartamentoAirbnb_ = await eventosPorApartamentoAirbnb(metadatosEventos);
                                for (const [fechaDia, contenedorEventos] of Object.entries(eventosPorApartamentoAirbnb_.eventosMes)) {
                                    const selectorDia = estructuraGlobal.eventosMes[fechaDia];
                                    selectorDia.push(...contenedorEventos);
                                }
                                estructuraGlobal.eventosEnDetalles.push(...eventosPorApartamentoAirbnb_.eventosEnDetalle);
                            }
                        }
                        salida.json(estructuraGlobal);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        return salida.json(error);
                    }
                }