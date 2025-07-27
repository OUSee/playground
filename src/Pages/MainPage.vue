<script setup lang='ts'>
import Canvas from '@/components/Canvas/Canvas.vue';

</script>

<template>
    <div class="container mt-60 ">
        <div class="separated">
            <div class="blueprint horizontal test-blueprint">
                <span class="arrow-top"></span>
                <span class="arrow-bottom"></span>
                <div class="blueprint vertical test-blueprint2">
                    <span class="arrow-top"></span>
                    <span class="arrow-bottom"></span>
                    <div class="img-wrapper">
                        <img src="@/assets/img/blueprint.svg" alt="">
                    </div>
                </div>
            </div>
            <div class="right-section">
                <h1>WELCOME TO THE PLAYGROUND</h1>
                <p>
                    feel free to browse through the projects and demos i've created and test em. Almost everything is
                    keeping secrets and interactive so click everywhere. <br> But if you are seriuos suit guy who came
                    just to offer me a job or find out about my skills feel free to go straight to <router-link
                        to="/work">Work</router-link> page or <router-link to="/Contact">Contact</router-link> page, you
                    will find all the nessesary information there. <br> Anyway <br><br> <strong>Enjoy!</strong>
                </p>
                <nav class="ml-auto w-fit">
                    <router-link class="button" to="/2dgame"><span>Play 2D Game</span></router-link>
                    <router-link class="button disabled" to="/games-lib">Titles Library</router-link>
                    <router-link class="button" to="/gyrogame">Gyro game</router-link>
                    <p>...more to go</p>
                </nav>

            </div>
        </div>

        <h2 class="mt-60">THE THREE</h2>
        <div class="blueprint horizontal">
            <span class="arrow-top"></span>
            <span class="arrow-bottom"></span>
            <Canvas></Canvas>
        </div>
        <router-link class="button disabled  mt-60 ml-auto" to="/three-demo">check demo</router-link>
    </div>
</template>

<style type="scss" scoped>
.test-blueprint {
    width: 50vw;
    height: 50vh;
}

.test-blueprint2 {
    width: 100%;
    height: 100%;
}

.separated {
    display: flex;
    gap: 50px;

    .blueprint {
        flex: 1 1 70%;
    }

    .right-section {
        flex: 0 1 auto;

        text-align: end;
    }

    @media (max-width: 600px) {
        flex-wrap: wrap;

        nav {
            flex-wrap: wrap;
            align-items: center;
            justify-content: end;
        }
    }
}

nav {
    display: flex;
    gap: 10px;
    align-items: center;
}
</style>