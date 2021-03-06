Ext.onReady(function () {
    //Reusable Components

    Ext.ns('dzz.COMPONENTS');

    var LOC = dzz.i18n.txt[4]; //for shortness

    //the main dataview in the center region
    Ext.define('dzz.COMPONENTS.homeGalleryDataView', {
        extend: 'Ext.view.View',

        alias: 'widget.homeGalleryDataView',

        trackOver: true,
        overItemCls: 'dzz-item-over',
        selectedItemCls: 'dzz-item-selected',
        itemSelector: 'div.dzz-thumb-wrapper',
        emptyText: LOC.homeGalleryDataView.emptyText,
        selectionModel: {mode: 'MULTI'},

        store: {
            autoLoad: true,
            type: 'json',
            fields: [
                {name: 'thumbUri'},
                {name: 'realUri'},
                {name: 'fileType'},
                {name: 'caption'}
            ],
            proxy: {
                type: 'ajax',
                url: 'scripts/tree/php/processUploads.php',
                actionMethods: {read: 'POST'},
                extraParams: {targetAction: 'getPhotos'},
                reader: {
                    type: 'json',
                    rootProperty: 'RECORDS'
                }
            }
        },

        initComponent: function () {
            var me = this;
            me.prepareTpl();
            me.callParent(arguments);
            me.getStore().getProxy().setExtraParam('path', me.confData.node.path);
            me.getStore().getProxy().setExtraParam('photosSort', me.confData.photosSort);
            me.on({
                itemcontextmenu: me.showContextMenu,
                itemdblclick: function (view, rec, item, index) {

                    //Starting fancybox entirely programmatically (without data-attributes).
                    //we need to build an array of elements, options and start index use for the $.fancybox.open() method:
                    //https://fancyapps.com/fancybox/3/docs/#api
                    var data = view.getStore().getData(); //the data is Ext.util.Collection
                    var items = [];
                    var dc = '?_dc=' + new Date().getTime(); //disable caching param - to ensure the actual picture is retrieved, for example, if it was rotated
                    data.each(function (item) {
                        var itemObj = {
                            src: item.get('realUri') + dc,
                            opts: {
                                caption: item.get('caption'),
                                thumb: '\'' + item.get('thumbUri') + dc + '\''
                            }
                        };
                        items.push(itemObj);
                    });

                    $.fancybox.open(items, {
                        animationEffect: 'zoom-in-out',
                        animationDuration: 500,
                        loop: true,
                        buttons: [
                            "zoom",
                            "share",
                            "slideShow",
                            "fullScreen",
                            "download",
                            "thumbs",
                            "close"
                        ],
                        x_transitionEffect: "tube"
                    }, index);
                }
            });
        },

        prepareTpl: function () {
            var me = this;

            var dc = '?_dc=' + new Date().getTime(); //disable caching param - to ensure the actual picture is retrieved, for example, if it was rotated
            var imageTpl = new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="dzz-thumb-wrapper" id="{caption}">',
                '   <a>',
                '       <div class="dzz-thumb-inner-wrapper" title="{caption}">',
                '           <tpl if="fileType == \'photo\'">',
                '               <div class="dzz-thumb-container" style="background-image: url(\'{thumbUri}' + dc + '\');"></div>',
                '           <tpl else>',
                '               <div style="height: 100%; display: flex; align-items: center; justify-content: center;">',
                '                   <video src="{realUri}" poster="{thumbUri}" autoplay muted width="100%"></video>',
                '               </div>',
                '           </tpl>',
                '       </div>',
                '       <div class="dzz-thumb-name">{caption}</div>',
                '   </a>',
                '</div>',
                '</tpl>'
            );

            Ext.apply(me, {tpl: imageTpl});

        },

        showContextMenu: function (view, rec, el, idx, e) {
            var me = this;

            if (view.getSelection().length == 0) //if clicking on an image directly with the right mouse button (it is not selected with the left one first)
            {
                return;
            }

            e.preventDefault();

            Ext.ComponentQuery.query('menu[galleryRole=galleryContextMenu]').forEach(
                function (menuInstance) {
                    menuInstance.destroy();
                }
            );

            var menu = Ext.widget({
                xtype: 'menu',
                galleryRole: 'galleryContextMenu',
                items: [
                    {
                        text: dzz.i18n.common.dateChange,
                        iconCls: 'dzz-icon-calendar',
                        handler: function (menuitem) {
                            Ext.widget({
                                    xtype: 'photoDateChange',
                                    recs: view.getSelection(),
                                    currentDate: view.getSelection()[0].get('date')
                                }
                            );
                        }
                    },
                    {
                        text: LOC.homeGalleryDataView.menuRotate,
                        iconCls: 'dzz-icon-rotate',
                        menu: {
                            items: [
                                {
                                    //text: 'Rotate 90 deg',
                                    text: LOC.homeGalleryDataView.menuRotate90,
                                    iconCls: 'dzz-icon-rotate-right',
                                    handler: function () {
                                        me.sendRequest({action: 'rotatePhotos', value: 90, recs: view.getSelection()})
                                    }
                                }, {
                                    //text: 'Rotate -90 deg',
                                    text: LOC.homeGalleryDataView.menuRotateMinus90,
                                    iconCls: 'dzz-icon-rotate-left',
                                    handler: function () {
                                        me.sendRequest({action: 'rotatePhotos', value: -90, recs: view.getSelection()})
                                    }
                                }, {
                                    //text: 'Rotate 180 deg',
                                    text: LOC.homeGalleryDataView.menuRotate180,
                                    iconCls: 'dzz-icon-rotate-flip',
                                    handler: function () {
                                        me.sendRequest({action: 'rotatePhotos', value: 180, recs: view.getSelection()})
                                    }
                                }
                            ]
                        }
                    },
                    {
                        //text: 'Delete...',
                        text: LOC.homeGalleryDataView.menuDelete,
                        iconCls: 'dzz-icon-delete',
                        handler: function () {
                            Ext.Msg.confirm(LOC.homeGalleryDataView.menuDeleteConfirmTitle,
                                view.getSelection().length + LOC.homeGalleryDataView.menuDeleteConfirmText,
                                function (btnText) {
                                    if (btnText === "yes") {
                                        me.sendRequest(
                                            {action: 'deletePhotos', recs: view.getSelection()}
                                        );
                                    }
                                }, view);
                        }
                    }
                ]
            }).showAt(e.getXY(), true);
        },

        sendRequest: function (config) {
            var me = this;

            var data = Ext.Array.pluck(config.recs, 'data');
            var photos = Ext.Array.pluck(data, 'realUri');

            var extraParams = {};
            if (config.action == 'rotatePhotos') {
                extraParams.rotateAngle = config.value;
            }

            Ext.Ajax.request({
                url: 'scripts/tree/php/processUploads.php',
                method: 'POST',
                params: Ext.Object.merge({targetAction: config.action, photos: Ext.encode(photos)}, extraParams),
                callback: function (opts, result, response) {

                    me.getStore().reload();
                    me.prepareTpl();
                    me.refresh();
                    me.up('window').down('treepanel').getStore().reload();
                }
            });

        }

    });

    //the process files/pinger button in the bottom left
    Ext.define('dzz.COMPONENTS.indexerButton', {
        extend: 'Ext.button.Button',

        alias: 'widget.indexerButton',
        disabled: true,
        scale: 'large',

        initComponent: function () {
            var me = this;
            me.callParent(arguments);

            me.task = {
                run: function () {
                    me.doRequest('ping');
                },
                interval: 5000
            };

            Ext.TaskManager.start(me.task);

            me.setHandler(function () {
                me.doRequest('processUploads');
            });

        },

        doRequest: function (actionType) {
            var me = this;

            Ext.Ajax.setTimeout(30000);

            if (actionType == 'processUploads') {
                me.setDisabled(true);
                me.processing = true;
                me.setText(LOC.indexerButton.processingPhotos); //'Processing photos...'
                Ext.Ajax.setTimeout(120000);
            }

            Ext.Ajax.request({
                url: 'scripts/tree/php/processUploads.php',
                method: 'POST',
                params: {targetAction: actionType},
                callback: function (opts, result, response) {

                    if (actionType == 'processUploads') {
                        me.prev('treepanel').getStore().reload();
                        me.processing = false;
                    } else {
                        var obj = Ext.decode(response.responseText);
                        var details = obj.details;
                        if (!details.status) {
                            me.setDisabled(true);
                            me.setText(LOC.indexerButton.noPhotos); //'Няма снимки за качване'
                        } else {
                            if (me.processing) {
                                me.setDisabled(true);
                                var txt = LOC.indexerButton.processingPhotos + ' (' + details.count + ' ' + LOC.indexerButton.remaining + ')...';
                            } else {
                                me.setDisabled(false);
                                var txt = '<b>' + LOC.indexerButton.newPhotos + ' (' + '<span style="color: #ff0000">' + details.count + '</span>)</b>';
                            }
                            me.setText(txt);
                        }

                        var diskStatusLabel = me.up('window').down('tbtext[dzzRole=diskStatusLabel]');
                        if (diskStatusLabel) {
                            diskStatusLabel.setData(details.diskStatus);
                        }
                    }

                }
            });


        }
    });

    //a small panel for changing the date of the photos
    Ext.define('dzz.COMPONENTS.photoDateChange', {
        extend: 'Ext.form.Panel',
        alias: 'widget.photoDateChange',
        bodyPadding: 3,
        url: 'scripts/tree/php/processUploads.php',
        items: [
            {xtype: 'hiddenfield', name: 'targetAction', value: 'changePhotoDates'},
            {xtype: 'hiddenfield', name: 'photos', value: ''},
            {
                xtype: 'displayfield',
                value: LOC.photoDateChange.displayField
            },
            {
                xtype: 'datefield',
                format: 'd.m.Y',
                submitFormat: 'Y/m/d',
                name: 'targetDate',
                editable: false,
                allowBlank: false,
                value: new Date(),
                fieldLabel: LOC.photoDateChange.dateFieldLbl
            }
        ],
        buttons: [
            {
                text: LOC.photoDateChange.btnWrite,
                //iconCls: 'dzz-icon-ok',
                iconCls: 'fas fa-check', faIconColor: '#008000', scale: 'medium',
                formBind: true,
                handler: function (btn) {
                    btn.up('form').submit();
                }
            },
            {
                text: LOC.photoDateChange.btnCancel,
                //iconCls: 'dzz-icon-delete',
                iconCls: 'fas fa-times', faIconColor: '#ff0000', scale: 'medium',
                handler: function (btn) {
                    btn.up('window').close();
                }
            }
        ],

        initComponent: function () {
            var me = this;
            me.callParent(arguments);
            me.extractData();
            me.showForm();
            me.getForm().on(
                {
                    actioncomplete: function (frm, action) {
                        frm.owner.up('window').close();
                        Ext.getCmp('dzzAppWindow').down('treepanel').getStore().reload();

                        var view = Ext.getCmp('dzzAppWindow').down('homeGalleryDataView');
                        if (view) {
                            view.getStore().reload();
                            view.refresh();
                        }
                    }
                }
            );
        },
        showForm: function () {
            var me = this;
            Ext.widget({
                xtype: 'window',
                modal: true,
                title: LOC.photoDateChange.winTitle,
                items: [me]
            }).show();
        },
        extractData: function () {
            var me = this;
            var data = Ext.Array.pluck(me.recs, 'data');
            var photos = Ext.Array.pluck(data, 'realUri');
            me.down('hiddenfield[name=photos]').setValue(Ext.encode(photos));
            me.down('datefield[name=targetDate]').setValue(new Date(me.currentDate));
        }
    });

    //a drag-n-drop upload window
    Ext.define('dzz.COMPONENTS.photoUploader', {
        extend: 'Ext.panel.Panel',
        alias: 'widget.photoUploader',
        //id: 'photoUploader',
        bodyPadding: 3,
        scrollable: true,
        //html: '<div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;" id="galleryUploader"; class="dropzone"></div>',
        html: '<div style="width: 100%; height: 100%;" id="galleryUploader"; class="dropzone"></div>',

        dockedItems: [
            {
                xtype: 'toolbar', dock: 'top',
                items: [
                    {
                        xtype: 'button', //text: 'Close',
                        text: LOC.photoUploader.tbBtnClose,
                        iconAlign: 'left', scale: 'large', iconCls: 'far fa-times-circle', faIconColor: '#ff0000',
                        handler: function (btn) {
                            btn.up('window').close();
                        }
                    },
                    {
                        xtype: 'button', //text: 'Start Uploading Images',
                        text: LOC.photoUploader.tbBtnUpload,
                        iconAlign: 'left', scale: 'large', iconCls: 'fas fa-play-circle', faIconColor: '#008000',
                        handler: function (btn) {
                            btn.up('photoUploader').dzInstance.processQueue();
                        },
                        bind: {
                            disabled: '{dzQueuedFiles <= 0}'
                        }
                    }, '->',
                    {
                        xtype: 'tbtext',
                        bind: {
                            data: {
                                total: '{dzTotalFiles}',
                                succ: '{dzUploadedFiles}',
                                fail: '{dzFailedFiles}',
                                size: '{dzTotalBytes}'
                            }
                        },
                        tpl: LOC.photoUploader.tbLblEnqueued + ': {total}; <span style="color: blue">' +
                        LOC.photoUploader.tbLblUploaded + ': {succ}</span>; <span style="color: red">' +
                        LOC.photoUploader.tbLblFailed + ': {fail}</span>; <b>{size:fileSize()}</b>'
                    },
                    {
                        xtype: 'progressbar', value: 0, width: 300,
                        id: 'pgbar',
                        textTpl: LOC.photoUploader.tbLblProgress + ': {value:percent("0")}', //Ext.util.Format functions are available here in XTemplate
                        bind: {
                            value: '{dzUploadedBytes / dzTotalBytes}',
                            visible: '{progressVisible}'
                        }
                    }
                ]
            }
        ],

        viewModel: {
            data: {
                dzTotalFiles: 0,
                dzQueuedFiles: 0,
                dzUploadedFiles: 0,
                dzFailedFiles: 0,
                dzTotalBytes: 0,
                dzUploadedBytes: 0,
                dzRemovedBytes: 0,
                progressVisible: false
            }
        },

        dzInstance: null,


        initComponent: function () {
            var me = this;

            me.callParent(arguments);

            me.on({
                afterrender: me.initDropZone,
                beforedestroy: me.handleDestroy
            });

            me.showInWindow();


        },

        initDropZone: function () {
            var me = this;

            //console.log('initalizing DropZone.js...');
            var dzConfig = {
                url: 'scripts/tree/php/dropZone/dropZone.php',
                autoProcessQueue: false,
                maxFilesize: null,
                timeout: 120000,
                acceptedFiles: 'image/*,video/*',
                addRemoveLinks: true,
                dictDefaultMessage: ''
            };

            //localize DZ if our locale is not en
            var defMsgPrefix = '<span style="font-size: 2em; color: #cccccc"><i class="fas fa-camera fa-10x"></i><span><br>';
            if (dzz.i18n.locale != 'en') {
                dzConfig = Ext.Object.merge(dzConfig, LOC.photoUploader.dropZone);
                dzConfig.dictDefaultMessage = defMsgPrefix + dzConfig.dictDefaultMessage;
            } else {
                dzConfig.dictDefaultMessage = defMsgPrefix + Dropzone.prototype.defaultOptions.dictDefaultMessage;
            }

            var dropZone = new Dropzone('div#galleryUploader', dzConfig);

            dropZone = me.attachDropZoneListeners(dropZone);

            me.dzInstance = dropZone;
        },

        attachDropZoneListeners: function (dz) {

            var me = this;

            var vm = me.getViewModel();

            dz.on('complete', function () {
                dz.processQueue();
                vm.set('dzQueuedFiles', dz.getQueuedFiles().length);
            });

            dz.on('processing', function () {
                dz.options.autoProcessQueue = true; //otherwise only 2 files will be processed upon processQueue() call (or the value of the parallelUploads config)
                vm.set('progressVisible', true);
            });

            dz.on('queuecomplete', function () {
                dz.options.autoProcessQueue = false;
                //this event is strangely fired by the destroy() call when you open the uploader, drop some files and click the Close button WITHOUT uploading them
                //seems to be the view model is already destroyed at this moment
                if (!vm.isDestroyed) {
                    vm.set('progressVisible', false);
                    vm.set('dzQueuedFiles', dz.getQueuedFiles().length);
                    //dz.removeAllFiles();
                }

            });

            //file uploaded successfully
            dz.on('success', function (file) {
                vm.set('dzUploadedFiles', vm.get('dzUploadedFiles') + 1);
                vm.set('dzUploadedBytes', vm.get('dzUploadedBytes') + file.upload.bytesSent);
                //dz.removeFile(file);
            });

            //file upload failed
            dz.on('error', function () {
                vm.set('dzFailedFiles', vm.get('dzFailedFiles') + 1);
            });

            //file added to dropzone area
            dz.on('addedfile', function (file) {
                vm.set('dzTotalFiles', vm.get('dzTotalFiles') + 1);
                vm.set('dzTotalBytes', vm.get('dzTotalBytes') + file.upload.total);
                Ext.defer(function () {
                    vm.set('dzQueuedFiles', dz.getQueuedFiles().length);
                }, 5);
            });

            //file removed from the dropzone area
            dz.on('removedfile', function (file) {
                vm.set('dzTotalFiles', vm.get('dzTotalFiles') - 1);
                vm.set('dzTotalBytes', vm.get('dzTotalBytes') - file.upload.total);
                vm.set('dzQueuedFiles', dz.getQueuedFiles().length);
            });

            //this is working incorrectly (or at least, the logic is not mine); see https://gitlab.com/meno/dropzone/-/issues/226
            dz.on('totaluploadprogress', function (val, tb, bs) {
                //console.log('Percent: ' + val + '; Total: ' + tb + '; Sent: ' + bs);
                //vm.set('dzTotalProgress', val / 100);
            });

            return dz;
        },

        showInWindow: function () {
            var me = this;

            var winConfig = {
                title: LOC.photoUploader.winTitle,
                width: window.innerWidth * .7,
                height: window.innerHeight * .7,
                layout: {type: 'fit'},
                modal: true,
                iconCls: 'fas fa-upload',
                items: [me]
            };

            Ext.widget('window', winConfig).show();
        },

        handleDestroy: function () {
            var me = this;

            //console.log('entering before destroy...');

            me.dzInstance.destroy(); //destroy DropZone instance

            if (me.getViewModel().get('dzUploadedFiles') > 0) {

                Ext.MessageBox.show({
                    title: LOC.photoUploader.closeDialog.title,
                    msg: LOC.photoUploader.closeDialog.text,
                    buttons: Ext.MessageBox.YESNO,
                    fn: function (btn) {
                        if (btn === 'yes') {
                            Ext.getCmp('dzzAppWindow').down('indexerButton').click();
                            Ext.toast(LOC.photoUploader.closeDialog.toastYes);
                        } else {
                            Ext.toast(LOC.photoUploader.closeDialog.toastNo);
                        }
                    }
                });
            }


        }
    });

});
