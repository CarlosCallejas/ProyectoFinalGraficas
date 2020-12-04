# ProyectoFinalGraficas
Equipo:
            Nombre             |   Matricula
------------------------------ | -------------
Carlos E. Callejas Mier        |  A01423262
Cristian I. Bravo Contreras    |  A01423382
Juan Diego Bastidas Santivañez |  A01423502

## Requerimientos funcionales
1. Simular la funcionalidad de un xilofono de 8 teclas (tambien se reproduciran sonidos de guitarra a elección del usuario)
2. Cada minuto cambiará la ambientación de la escena
3. Cada nota del xilofono cambiara el color de un segmento de un plano en el centro de la escena
4. Habrá un personaje bailando sobre el plano mientras el usuario toca el xilofono
   1. El personaje solo bailará mientras el usuario esta tocando el xilofono
5. La ambientacion de la escena utilizara efectos de postProcesamiento y Skybox
6. El usuario podrá interactuar con el xilofono con el mouse

## Resolucion de los requerimientos 
1.  Para la funcionalidad del xilofono utilizaremos la Web audio API junto con THREEjs para reproducir los sonidos
    1. Para mostrar el xilofono se ocuparan objetos 3d
    2. Se podrá interactuar con el xilofono con el mouse
    3. Se podrá interactuar con el xilofono con el teclado
2. Para el cambio de ambientación se aplicara un cambio en las luces de la escena
3. Se hara un cambio en los colores de la pista y del xilofono
4. Se buscara un modelo humanoide en 3d con huesos para hacer la animación
5. Para la ambientación de la escena se usará el efecto de UnrealBloom
6. Nos basaremos del ejemplo 13 en clase de interaccion con la escena

## Plan de trabajo
1. Reproducir sonidos - Cristian
2. Cargar modelo 3d de la persona y crear el objeto del xilofono -JuanDiego
3. Generar la interaccion del mouse con xilofono - Cristian
4. Creación y modificación de luces -JuanDiego
5. Efectos de post procesamiento -Carlos
6. Cambio de color de las pistas -Carlos
7. Generar la animación del humanoide - Juandiego
8. Creacion de las pistas de Baile -Carlos
