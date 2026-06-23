class TemplateMagistratura extends Templates {


    constructor(modo, constants) {
        super(modo, constants);
        Handlebars.registerHelper('incrementar', _helper_incrementar);

        
        /**
         * Helper de Handlebars para incrementar el valor dado en el parámetro ``value``.
         * @param {*} value - Valor que se desea incrementar.
         * @param {*} options - Parámetro no utilizado por la función.
         * @returns {number} - Valor incrementado en una unidad.
         */
        function _helper_incrementar(value, inicio, options){
            return parseInt(value) + inicio;
        }
      }


    /**
     * Devuelve el nombre del template para un candidato
     * 
     * @override
     * @param {*} candidato - El candidato a crearle el botón.
     * @returns {String} Nombre del template que usa el candidato
     */
    __get_template_name_candidato(candidato, candidatos) {
        return "candidato";
    }

    /**
     * Genera un diccionario de candidatos.
     *
     * @param {*} candidato - Candidato del que queremos mostrar los "subcandidatos".
     * @param {*} id_boton - Identificador del botón.
     * @param {*} vista Lugar donde se van a mostrar tales candidatos. Pueden ser: "barra_lateral", "boton_candidato", "confirmacion", "verificacion".
     * @returns {Object} Datos del candidato.
     */
    main_dict_candidato(candidato, id_boton, vista) {
        var data = this.__main_dict_base(id_boton);
        data.candidato = candidato;
        data.blanco = candidato.clase == "Blanco";

        let candidatos_confirmacion = [];
        if (typeof (candidato.secundarios) !== "undefined") {
            data.secundarios = this.__construir_candidatos(candidato, "secundarios", vista);
            if (!candidato.cargo_ejecutivo && candidato.codigo !== "BLC") {
                var filter = {
                    clase: "Candidato",
                    cod_lista: candidato.cod_lista,
                    cod_categoria: candidato.cod_categoria,
                };
                candidatos_confirmacion = local_data.candidaturas.many(filter);
            }
        }

        if (typeof (candidato.suplentes) !== "undefined") {
            data.suplentes = this.__construir_candidatos(candidato, "suplentes", vista);
        }

        // si no es un cargo ejecutivo, inserto el 1er candidato adelante
        // de todo, excepto BLC
        if (!candidato.cargo_ejecutivo && candidato.codigo !== "BLC") {
            let candidato_principal = {
                nombre: candidato.nombre,
                nro_orden: candidato.nro_orden,
                id_candidatura: candidato.id_candidatura
            };

            if (typeof (candidato.imagenes) !== "undefined")
                candidato_principal.imagen = candidato.imagenes[0];

            data.candidatos_confirmacion = candidatos_confirmacion;
        }
        return data;
    }

    /**
     * Renderiza template "candidatos_adicionales".
     *
     * @param {*} candidato - Candidato del que queremos mostrar los "subcandidatos".
     * @param {*} campo - Campo dentro del objeto candidato. Puede ser "secundarios" o "suplentes".
     * @param {*} vista - Lugar donde se van a mostrar tales candidatos. Pueden ser: "barra_lateral", "boton_candidato", "confirmacion", "verificacion".
     */
    __construir_candidatos(candidato, campo, vista) {
        var candidatos = this.__traer_candidatos_template(candidato, campo, vista);
        var data = {
            candidatos: candidatos,
            agregar_numeracion: true,
            inicio: (campo=="suplentes") ? 1 : 2
        };

        var template = get_template_desde_cache("candidatos_adicionales");
        return template(data);
    }

    /**
     * Crea el contenido del boton de verificacion.
     *
     * @param {*} candidato - El candidato a crearle el botón.
     * @param {*} template - Template de verificacion (Handlebars).
     * @returns {String} Html en formato de cadena de caracteres.
     */
    __crear_item_verificacion(candidato, categoria, template) {
        var self = this;
        //el template de verificacion usa un partial que debemos registrar previo a devolverlo
        Handlebars.registerPartial(
            "componenteVerificacion",
            get_template_desde_cache(template_name_componente_verificacion(candidato, categoria))
        );
        return super.__crear_item_verificacion(candidato, categoria, template);


        function template_name_componente_verificacion(candidato, categoria) {   
            return "verificacion_con_secundarios_y_suplentes";
        }
    }
}

templateClass = new TemplateMagistratura(get_modo(), constants);