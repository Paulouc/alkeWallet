$(document).ready(function () {
    if ($('#loginForm').length) {
        $('#loginForm').submit(function (e) {
            e.preventDefault();

            const user = $('#username').val();
            const password = $('#password').val();

            if (user === 'admin' && password === '1234') {
                //localStorage.setItem('saldo', 1000);
                window.location.href = 'menu.html';
            } else {
                $('#alert-container').html(`
          <div class="alert alert-danger" role="alert">
            Credenciales incorrectas
          </div>
        `);
            }
        });
    }
    let saldo = Number(localStorage.getItem('saldo')) || 10000;
    let contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    actualizarSaldo();

    function guardarTransaccion(tipo, monto, banco, cuenta, nombre) {
        let historial = JSON.parse(localStorage.getItem('transacciones')) || [];
        const nuevaTransaccion = {
            tipo: tipo,
            monto: monto,
            banco: banco,
            cuenta: cuenta,
            nombre: nombre,
            fecha: new Date().toLocaleString()
        };
        historial.unshift(nuevaTransaccion);
        localStorage.setItem('transacciones', JSON.stringify(historial));
    }

    function actualizarSaldo() {
        //$("#saldoMenu").text("Saldo: $" + saldo.toLocaleString());
        //saldo = Number(localStorage.getItem('saldo'));
        if (saldo < 5000) {
            $("#saldo")
                .removeClass("saldo-alto")
                .addClass("saldo-bajo");
        } else {
            $("#saldo")
                .removeClass("saldo-bajo")
                .addClass("saldo-alto");
        }
    }



    $('#saldo').text(saldo);

    $('#depositar').click(function () {
        $('#mensaje').text('Redirigiendo a Depósito...');
        setTimeout(function () {
            window.location.href = 'deposit.html';
        }, 1000);
    });

    $('#enviar').click(function () {
        $('#mensaje').text('Redirigiendo a Enviar Dinero...');
        setTimeout(function () {
            window.location.href = 'sendmoney.html';
        }, 1000);
    });

    $('#movimientos').click(function () {
        $('#mensaje').text('Redirigiendo a Últimos Movimientos...');
        setTimeout(function () {
            window.location.href = 'transactions.html';
        }, 1000);
    });



    if ($('#depositar').length) {

        function redirigir(texto, pagina) {
            $('#mensaje').text(`Redirigiendo a ${texto}...`);
            setTimeout(() => window.location.href = pagina, 1000);
        }

        $('#depositar').click(() => redirigir('Depósito', 'deposit.html'));
        $('#enviar').click(() => redirigir('Enviar Dinero', 'sendmoney.html'));
        $('#movimientos').click(() => redirigir('Últimos Movimientos', 'transactions.html'));
    }


    if ($('#depositForm').length) {
        $('#saldo').text(saldo);

        $('#depositForm').submit(function (e) {
            e.preventDefault();

            const monto = Number($('#monto').val());
            if (monto <= 0) {
                alert('Ingrese un monto válido');
                return;
            }

            saldo += monto;
            localStorage.setItem('saldo', saldo);
            guardarTransaccion('deposito', monto, '', '', '');

            $('#saldo').text(saldo);
            $('#leyenda').text(`Monto depositado: $${monto}`);


            $('#alert-container').html(`
        <div class="alert alert-success mt-2">
          Depósito realizado con éxito
        </div>
      `);

            setTimeout(() => window.location.href = 'menu.html', 1000);
        });
    }


    if ($('#nuevo').length) {

        let seleccionado = null;

        function render(lista) {
            $('#lista').empty();
            lista.forEach((c, i) => {
                $('#lista').append(`
          <li class="list-group-item" data-i="${i}"> Nombre: 
            ${c.nombre},  Rut: ${c.rut}, 
            <br><small class="text-secondary">
                Cuenta Bancaria: ${c.cuenta} - ${c.banco}
            </small>
          </li>
        `);
            });
        }
        render(contactos);

        $('#nuevo').click(() => $('#formContacto').show());
        $('#cancelar').click(() => $('#formContacto').hide());

        $('#formContacto').submit(function (e) {
            e.preventDefault();
            if ($('#banco').val() === '') {
                alert('Seleccione un banco');
                return;
            }
            contactos.push({
                rut: $('#rut').val(),
                nombre: $('#nombre').val(),
                cuenta: $('#nCuenta').val(),
                banco: $('#banco').val()
            });
            console.log(contactos)
            localStorage.setItem("contactos", JSON.stringify(contactos));
            render(contactos);
            this.reset();
            $('#formContacto').hide(); 
            
    });

        $('#buscar').on('keyup', function () {
            const texto = $(this).val().toLowerCase();
            render(contactos.filter(c => c.nombre.toLowerCase().includes(texto)));
        });

        $(document).on('click', '.list-group-item', function () {
            $('.list-group-item').removeClass('selected');
            $(this).addClass('selected');
            let index = $(this).data('i');
            seleccionado = contactos[index];
            console.log(seleccionado);
            $('#enviarBtn').show();
        });

        $('#enviarBtn').click(function () {
            let monto = Number($('#montoEnvio').val());

            if (monto <= 0) {
                alert('Ingrese un monto válido');
                return;
            }

            if (monto > saldo) {
                alert('Saldo insuficiente');
                return;
            }

            saldo = saldo - monto;
            localStorage.setItem('saldo', saldo);
            guardarTransaccion(
                'transferencia',
                monto,
                seleccionado.banco,
                seleccionado.cuenta,
                seleccionado.nombre
            );

            $('#confirmacion').text('Transferencia a ' + seleccionado.nombre + ' realizada con exito');

            setTimeout(function () {
                window.location.href = 'menu.html';
            }, 2000);
        });

    }


    if ($('#filtro').length) {

        function getTipoTransaccion(tipo) {
            const nombres = {
                deposito: 'Depósito',
                transferencia: 'Transferencia'
            };
            return nombres[tipo] || 'Otro';
        }

        function mostrarUltimosMovimientos(filtro) {
            $('#lista').empty();

            // LEER DEL LOCALSTORAGE
            const listaTransacciones = JSON.parse(localStorage.getItem('transacciones')) || [];

            const filtradas = listaTransacciones.filter(t => filtro === 'todos' || t.tipo === filtro);

            if (filtradas.length === 0) {
                $('#lista').append('<li class="list-group-item text-muted">No hay movimientos registrados</li>');
                return;
            }

            filtradas.forEach(t => {

                let detalle = '';
                if (t.tipo === 'transferencia') {
                    detalle = `
            <br><small class="text-secondary">
                Para: ${t.nombre} || Cuenta: ${t.cuenta} · ${t.banco}
            </small>
        `;
                }

                $('#lista').append(`
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <strong>${getTipoTransaccion(t.tipo)}</strong>
                ${detalle}
                <br><small class="text-secondary">${t.fecha || ''}</small>
            </div>
            <span class="badge ${t.tipo === 'deposito' ? 'bg-success' : 'bg-danger'} rounded-pill">
                $${t.monto}
            </span>
        </li>
    `);
            });
        }

        $('#filtro').change(function () {
            mostrarUltimosMovimientos($(this).val());
        });

        // Carga inicial
        mostrarUltimosMovimientos('todos');
    }

});
