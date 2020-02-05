/* On mouse hover, lighten state color */
        path:hover {
            fill-opacity: .7;
        }

        /* Style for Custom Tooltip */
        

        /* Legend Font Style */
        body {
            font: 11px sans-serif;
            background-color:#C3D9D1;
            margin: 0px;
            padding: 0px;
            height: 100vh;
            max-height: 100vh;
            overflow: hidden;

        }

        /* Legend Position Style */

        

        .state_text{
            font-weight: 700;
            font-family: Helvetica, Arial, sans-serif;
        }
        .state:hover {
            fill: none;
            fill-opacity: 0.2;
            /*cursor: default;*/
            stroke-width: 3px;
        }
        div.tooltip {
            color: #000000;
            border-radius: 5px;
            /*opacity: 0.9;*/
            position: absolute;
            width: 29vmin;
            visibility: hidden;
            /*pointer-events: none;*/
        }
         .map{
            margin: 0;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
        } 
        .svg{
            display: inline-block;
            vertical-align: middle;
        }
        h3{
            margin: 0;
            text-align: center;
            font-size: 1vw;
            margin-bottom: 5px
        }
        .tooltip-category{
            padding: 0;
            margin: 0;
            font-size: 1vw;
        }
        #legend{
            margin: 0;
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translate(-50%, 0);
            width: 70vw;
        }
