<template>
    <div>
        <el-input placeholder="请输入搜索的歌名，歌手，专辑" v-model="keyword" @keyup.enter.native="search" clearable prefix-icon="el-icon-search" class="input-with-select">
            <el-select v-model="search_engine" slot="prepend" placeholder="请选择平台">
                <el-option label="QQ" value="qq"></el-option>
                <el-option label="酷我" value="kw"></el-option>
                <el-option label="虾米" value="xm"></el-option>
                <el-option label="酷狗" value="kg"></el-option>
                <el-option label="百度" value="bd"></el-option>
                <el-option label="网易" value="wy"></el-option>
            </el-select>
            <el-button @click="search" slot="append" type="success">搜索</el-button>
        </el-input>

        <el-table
                v-loading="loading"
                :data="songData"
                height="560"
                max-height="560"
                style="width: 100%">
            <el-table-column
                    prop="songname_ori"
                    label="歌名"
                    >
                <template slot-scope="songData">
                    <span v-html="songData.row.songname_ori"></span>
                </template>
            </el-table-column>
            <el-table-column
                    prop="singer"
                    label="歌手"
                    >
                <template slot-scope="songData">
                    <span v-html="songData.row.singer"></span>
                </template>
            </el-table-column>
            <el-table-column
                    prop="albumname_ori"
                    label="专辑">
                <template slot-scope="songData">
                    <span v-html="songData.row.albumname_ori"></span>
                </template>
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作">
                <template slot-scope="scope">
                    <el-button
                            @click.native.prevent="select(scope.$index, songData)"
                            type="text"
                            size="small">
                        获取链接
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div style="text-align: center;">
            <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :total="totalSize"
                @current-change="setCurPage"
                layout="prev, pager, next">
            </el-pagination>
        </div>

        <el-dialog
                title="下载选择"
                :visible.sync="dialogVisible"
                width="40%">
            <div v-loading.lock="select_loading">
                <img v-if="songUrlData.hasOwnProperty('专辑封面')" :src="songUrlData['专辑封面']" style="width: 58%; vertical-align: top;"/>
                <div style="margin-left: 5px;width: 30%; display: inline-block">
                    <div style="margin-bottom: 5px"><el-button @click="download('24AAC', songUrlData['24AAC'])" size="mini" round v-if="songUrlData.hasOwnProperty('24AAC')">24AAC</el-button></div>
                    <div style="margin-bottom: 5px"><el-button @click="download('128MP3', songUrlData['128MP3'])" size="mini" type="primary" round v-if="songUrlData.hasOwnProperty('128MP3')">128MP3</el-button></div>
                    <div style="margin-bottom: 5px"><el-button @click="download('320MP3', songUrlData['320MP3'])" size="mini" type="success" round v-if="songUrlData.hasOwnProperty('320MP3')">320MP3</el-button></div>
                    <div style="margin-bottom: 5px"><el-button @click="download('FLAC', songUrlData['FLAC'])" size="mini" type="info" round v-if="songUrlData.hasOwnProperty('FLAC')">FLAC</el-button></div>
                    <div style="margin-bottom: 5px"><el-button @click="download('APE', songUrlData['APE'])" size="mini" type="warning" round v-if="songUrlData.hasOwnProperty('APE')">APE</el-button></div>
                    <el-button-group>
                        <el-button @click="download('MV', songUrlData['MV'])" size="mini" type="danger" round v-if="songUrlData.hasOwnProperty('MV')">MV</el-button>
                        <el-button @click="download('lrc', songUrlData['lrc'])" size="mini" round v-if="songUrlData.hasOwnProperty('lrc')">歌词</el-button>
                    </el-button-group>
                </div>

                <el-progress style="margin-top: 5px" :stroke-width="10" :percentage="percentage"></el-progress>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="success" size="mini" round @click="openFolder">打开下载文件夹</el-button>
                <el-button type="primary" size="mini" round @click="dialogVisible = false">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: 'MainPage',
    data () {
      return {
        keyword: '',
        search_engine: 'qq',
        loading: false,
        select_loading: false,
        songData: [],
        songUrlData: {},
        songFilename: '',
        dialogVisible: false,
        currentPage: 1,
        pageSize: 15,
        totalSize: 0,
        headers: {
          'Cookie': 'Tip_of_the_day=2; encrypt_data=5ccfba13bd5b4343b3428176458710e1ffc926359bd13e3ec2ee75e261891484a92dec8d269619a2cc57ada1a2aabe6012baf2f135a17dc6ae4e5f2735054d438dd90f33889ddcc150025d7aaee1fb8956996beeef4ac0937599c42c0a90f689be52dedb0d0aef057255fb2a8e86cc84643a139acb83217e8d3a9a1ab022f583',
          'Host': 'moresound.tk',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'multipart/form-data'
        },
        percentage: 0,
        ipc: require('electron').ipcRenderer,
        app: require('electron').remote.app
      }
    },
    methods: {
      openFolder () {
        this.app.shell.showItemInFolder('.')
      },
      setCurPage (pageNum) {
        this.currentPage = pageNum
        this.search()
      },
      search () {
        var options = {
          url: 'http://moresound.tk/music/api.php?search=' + this.search_engine,
          headers: this.headers,
          timeout: 5000,
          formData: {
            // 'w': encodeURIComponent(this.keyword),
            'w': this.keyword,
            'p': this.currentPage,
            'n': this.pageSize
          }
        }
        this.loading = true
        let that = this
        this.app.request_remote.post(options, (error, response, body) => {
          that.loading = false
          console.log('error: ', error)
          if (!error && response.statusCode === 200) {
            console.log(body)
            let res = JSON.parse(body)
            if (res['code'] !== 0) {
              this.$message.error(res['msg'])
              return
            }
            if (res['num'] === 0) {
              that.$message.warning('抱歉，没有找到相关歌曲')
              return
            }
            that.currentPage = res['page']
            that.totalSize = res['totalnum']
            that.songData = []
            for (let i = 0; i < res['song_list'].length; i++) {
              let singer = res['song_list'][i]['singer'][0]['name']
              let songname = res['song_list'][i]['songname']
              let albumname = res['song_list'][i]['albumname']
              let songmid = res['song_list'][i]['songmid']
              that.songData.push({
                'id': i,
                'songname_ori': songname,
                'songname': songname.replace(/<sup.*>(.|\n|\r)*<\/sup>/, '').replace('&nbsp;', ' ').replace(/^\s+|\s+$/g, ''),
                'albumname_ori': albumname,
                'albumname': albumname.replace('&nbsp;', ' ').replace(/^\s+|\s+$/g, ''),
                'singer': singer,
                'songmid': songmid
              })
            }
          }
        })
      },
      select (index, rows) {
        this.dialogVisible = true
        this.select_loading = true
        let itemData = rows[index]
        console.log(itemData)

        let options = {
          url: 'http://moresound.tk/music/api.php?get_song=' + this.search_engine,
          headers: this.headers,
          timeout: 5000,
          formData: {
            'mid': itemData['songmid']
          }
        }
        let that = this
        this.app.request_remote.post(options, (error, response, body) => {
          that.select_loading = false
          console.log('error: ', error)
          if (!error && response.statusCode === 200) {
            let res = JSON.parse(body)
            console.log(res)
            let reg = new RegExp('/', 'g')
            that.songFilename = res['song'] + '-' + res['singer'].replace(reg, '&')
            that.songUrlData = res['url']
          }
        })
      },
      downloadFile (type, body) {
        if (type === 'lrc') {
          this.app.fs.writeFile('./' + this.songFilename + '.lrc', body, (error) => {
            if (error) {
              console.log(error)
            }
          })
          this.percentage = 100
          this.download_status = 'success'
          return
        }
        let res = JSON.parse(body)
        var receivedBytes = 0
        var totalBytes = 0

        var req = this.app.request_remote({
          method: 'GET',
          uri: res['url']
        })

        var out = this.app.fs.createWriteStream('./' + this.songFilename + '.' + res['suffix'])
        req.pipe(out)

        req.on('response', function (data) {
          // Change the total bytes value to get progress later.
          totalBytes = parseInt(data.headers['content-length'], 10)
        })

        let that = this
        req.on('data', function (chunk) {
          receivedBytes += chunk.length
          that.percentage = parseInt(receivedBytes / totalBytes * 100)
          console.log(receivedBytes, totalBytes, that.percentage)
        })

        req.on('end', function () {
          that.percentage = 100
          that.download_status = 'success'
          console.log('下载完成')
        })
      },
      download (type, url) {
        console.log(type, url)
        this.percentage = 0
        let options = {
          url: 'http://moresound.tk/music/' + url
        }
        let that = this
        this.app.request_remote.get(options, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            console.log(body)
            let res = JSON.parse(body)
            if (res.hasOwnProperty('code') && res['code'] !== 0) {
              options['headers'] = that.headers
              this.app.request_remote.get(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                  console.log(body)
                  this.downloadFile(type, body)
                }
              })
            } else {
              this.downloadFile(type, body)
            }
          }
        })
      }
    }
  }
</script>

<style scoped>
    .el-select {
        width: 120px;
    }
</style>
