import { api, util } from "siyuan_api_cache_lib"
import { onMounted, ref } from "vue"
export interface IConfig {
    colors?: string[]
}
export const useConfig = () => {
    const id = util.currentNodeId()!
    const my_config_url = ref<string>("")
    onMounted(async () => {
        my_config_url.value = (await api.getBlockAttr(id, "custom-config"))?.value || ""
        const current_config_url = window.localStorage.getItem("sy-canvas-config")
        if (current_config_url != null && current_config_url != my_config_url.value) {
            my_config_url.value = current_config_url
            await api.setBlockAttrs({
                id: id,
                attrs: {
                    'custom-config': my_config_url.value
                }
            })
        }
        if (current_config_url == null && my_config_url.value != "")
            window.localStorage.setItem("sy-canvas-config", my_config_url.value)
        readConfig()
    })
    const set_config_url = (newu: string) => {
        my_config_url.value = newu

    }
    const comfirm_change = () => {
        window.localStorage.setItem("sy-canvas-config", my_config_url.value)
        api.setBlockAttrs({
            id: id,
            attrs: {
                'custom-config': my_config_url.value
            }
        })
        readConfig()
    }
    const config = ref<IConfig | null>(null)
    const readConfig = async () => {
        try {
            let id = my_config_url.value
            if (my_config_url.value.startsWith("siyuan://blocks/"))
                id = id.substring(16)
            const dataq = await api.sqlQuery(`select * from blocks where id="${id}"`)
            if ((dataq.data as any[]).length > 0) {
                config.value = JSON.parse((dataq.data as any)[0].content)
            }
        } catch (error) {
            console.error("sy-canvas config parse error")
        }

    }
    return {
        my_config_url,
        set_config_url,
        comfirm_change,
        config
    }
}
